#!/usr/bin/env python3
"""
Import data from JSON files to PostgreSQL.
Used for migration from Supabase.

Usage:
    python scripts/import_to_postgres.py --input-dir ./data_export

Environment variables required:
    DATABASE_URL - PostgreSQL connection URL
"""
import os
import sys
import json
import asyncio
import argparse
from datetime import datetime
from pathlib import Path
from typing import Any
import logging

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    from sqlalchemy import text
    from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
    from sqlalchemy.orm import sessionmaker
except ImportError:
    print("Error: sqlalchemy package not installed. Run: pip install sqlalchemy[asyncio]")
    sys.exit(1)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PostgresImporter:
    """Import data from JSON files to PostgreSQL."""

    def __init__(self, database_url: str):
        self.engine = create_async_engine(database_url, echo=False)
        self.async_session = sessionmaker(
            self.engine, class_=AsyncSession, expire_on_commit=False
        )
        self.stats = {"imported": {}, "errors": {}}

    async def test_connection(self) -> bool:
        """Test database connection."""
        try:
            async with self.engine.connect() as conn:
                result = await conn.execute(text("SELECT 1"))
                return result.scalar() == 1
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            return False

    async def import_table(self, table_name: str, rows: list[dict]) -> int:
        """
        Import rows to a table.
        
        Args:
            table_name: Target table name
            rows: List of row dictionaries
            
        Returns:
            Number of rows imported
        """
        if not rows:
            logger.info(f"No rows to import for {table_name}")
            return 0
        
        imported = 0
        errors = 0
        
        async with self.async_session() as session:
            for row in rows:
                try:
                    # Build INSERT statement
                    columns = list(row.keys())
                    placeholders = [f":{col}" for col in columns]
                    
                    stmt = text(f"""
                        INSERT INTO {table_name} ({', '.join(columns)})
                        VALUES ({', '.join(placeholders)})
                        ON CONFLICT (id) DO NOTHING
                    """)
                    
                    await session.execute(stmt, row)
                    imported += 1
                    
                    # Commit in batches
                    if imported % 100 == 0:
                        await session.commit()
                        logger.info(f"  {table_name}: {imported}/{len(rows)} rows imported")
                        
                except Exception as e:
                    errors += 1
                    logger.warning(f"  Error importing row to {table_name}: {e}")
            
            await session.commit()
        
        self.stats["imported"][table_name] = imported
        self.stats["errors"][table_name] = errors
        
        return imported

    async def import_all(self, data_dir: Path) -> dict:
        """Import all tables from JSON files."""
        # Check for complete export first
        complete_path = data_dir / "complete_export.json"
        if complete_path.exists():
            logger.info("Loading complete export file...")
            with open(complete_path) as f:
                export = json.load(f)
                all_data = export.get("data", {})
        else:
            # Load individual files
            all_data = {}
            for json_file in data_dir.glob("*.json"):
                if json_file.name in ["export_summary.json", "complete_export.json"]:
                    continue
                table_name = json_file.stem
                with open(json_file) as f:
                    all_data[table_name] = json.load(f)
        
        # Import order matters for foreign keys
        import_order = [
            "profiles",
            "categories",
            "products",
            "product_images",
            "messages",
            "purchases",
            "notifications",
        ]
        
        for table_name in import_order:
            if table_name in all_data:
                rows = all_data[table_name]
                logger.info(f"Importing {table_name} ({len(rows)} rows)...")
                await self.import_table(table_name, rows)
        
        # Import any remaining tables
        for table_name, rows in all_data.items():
            if table_name not in import_order and table_name not in self.stats["imported"]:
                logger.info(f"Importing {table_name} ({len(rows)} rows)...")
                await self.import_table(table_name, rows)
        
        return self.stats

    async def validate_import(self, data_dir: Path) -> dict:
        """Validate imported data against export."""
        summary_path = data_dir / "export_summary.json"
        if not summary_path.exists():
            logger.warning("No export_summary.json found for validation")
            return {}
        
        with open(summary_path) as f:
            expected = json.load(f)
        
        validation = {}
        
        async with self.engine.connect() as conn:
            for table, expected_count in expected.get("row_counts", {}).items():
                try:
                    result = await conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                    actual_count = result.scalar()
                    validation[table] = {
                        "expected": expected_count,
                        "actual": actual_count,
                        "match": expected_count == actual_count
                    }
                except Exception as e:
                    validation[table] = {"error": str(e)}
        
        return validation

    async def close(self):
        """Close database connection."""
        await self.engine.dispose()


async def main():
    parser = argparse.ArgumentParser(description="Import JSON data to PostgreSQL")
    parser.add_argument("--input-dir", type=str, default="./data_export", help="Input directory")
    parser.add_argument("--validate", action="store_true", help="Validate import after completion")
    args = parser.parse_args()
    
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        print("Error: DATABASE_URL environment variable required")
        print("Example: postgresql+asyncpg://user:password@localhost:5432/hekka_market")
        sys.exit(1)
    
    input_dir = Path(args.input_dir)
    if not input_dir.exists():
        print(f"Error: Input directory not found: {input_dir}")
        sys.exit(1)
    
    importer = PostgresImporter(database_url)
    
    print("Testing database connection...")
    if not await importer.test_connection():
        print("Error: Could not connect to database")
        sys.exit(1)
    print("Connection successful!")
    
    print("\nImporting data...")
    stats = await importer.import_all(input_dir)
    
    print("\nImport Summary:")
    print("-" * 40)
    for table, count in stats.get("imported", {}).items():
        errors = stats.get("errors", {}).get(table, 0)
        print(f"  {table}: {count} rows imported ({errors} errors)")
    
    if args.validate:
        print("\nValidating import...")
        validation = await importer.validate_import(input_dir)
        print("\nValidation Results:")
        print("-" * 40)
        all_valid = True
        for table, result in validation.items():
            if "error" in result:
                print(f"  {table}: ERROR - {result['error']}")
                all_valid = False
            else:
                status = "✓" if result["match"] else "✗"
                print(f"  {table}: {status} (expected: {result['expected']}, actual: {result['actual']})")
                if not result["match"]:
                    all_valid = False
        
        if all_valid:
            print("\n✓ All tables validated successfully!")
        else:
            print("\n✗ Validation failed - some tables have mismatches")
    
    await importer.close()
    print("\nImport complete!")


if __name__ == "__main__":
    asyncio.run(main())
