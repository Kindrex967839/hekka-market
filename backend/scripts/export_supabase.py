#!/usr/bin/env python3
"""
Export data from Supabase to JSON files.
Used for migration to self-hosted PostgreSQL.

Usage:
    python scripts/export_supabase.py [--output-dir ./data_export]

Environment variables required:
    SUPABASE_URL - Supabase project URL
    SUPABASE_SERVICE_KEY - Supabase service role key (for admin access)
"""
import os
import sys
import json
import asyncio
import argparse
from datetime import datetime
from pathlib import Path
from typing import Any

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    from supabase import create_client, Client
except ImportError:
    print("Error: supabase package not installed. Run: pip install supabase")
    sys.exit(1)


class SupabaseExporter:
    """Export data from Supabase tables to JSON files."""

    def __init__(self, url: str, key: str):
        self.client: Client = create_client(url, key)
        self.export_data: dict[str, list[dict]] = {}

    async def export_table(self, table_name: str, batch_size: int = 1000) -> list[dict]:
        """
        Export all rows from a table.
        
        Args:
            table_name: Name of the table to export
            batch_size: Number of rows per request
            
        Returns:
            List of row dictionaries
        """
        print(f"Exporting table: {table_name}")
        all_rows = []
        offset = 0
        
        while True:
            response = self.client.table(table_name).select("*").range(offset, offset + batch_size - 1).execute()
            
            if not response.data:
                break
            
            all_rows.extend(response.data)
            print(f"  Exported {len(response.data)} rows (total: {len(all_rows)})")
            
            if len(response.data) < batch_size:
                break
            
            offset += batch_size
        
        self.export_data[table_name] = all_rows
        return all_rows

    async def export_all(self) -> dict[str, list[dict]]:
        """Export all application tables."""
        tables = [
            "profiles",
            "categories",
            "products",
            "product_images",
            "messages",
            "purchases",
            "notifications",
        ]
        
        for table in tables:
            try:
                await self.export_table(table)
            except Exception as e:
                print(f"  Warning: Could not export {table}: {e}")
                self.export_data[table] = []
        
        return self.export_data

    def save_to_files(self, output_dir: Path) -> None:
        """Save exported data to JSON files."""
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Save individual table files
        for table_name, rows in self.export_data.items():
            file_path = output_dir / f"{table_name}.json"
            with open(file_path, "w") as f:
                json.dump(rows, f, indent=2, default=str)
            print(f"Saved {len(rows)} rows to {file_path}")
        
        # Save complete export
        complete_path = output_dir / "complete_export.json"
        export_with_meta = {
            "exported_at": datetime.utcnow().isoformat(),
            "tables": list(self.export_data.keys()),
            "row_counts": {k: len(v) for k, v in self.export_data.items()},
            "data": self.export_data
        }
        with open(complete_path, "w") as f:
            json.dump(export_with_meta, f, indent=2, default=str)
        print(f"Saved complete export to {complete_path}")
        
        # Save summary
        summary_path = output_dir / "export_summary.json"
        summary = {
            "exported_at": datetime.utcnow().isoformat(),
            "tables": list(self.export_data.keys()),
            "row_counts": {k: len(v) for k, v in self.export_data.items()},
            "total_rows": sum(len(v) for v in self.export_data.values())
        }
        with open(summary_path, "w") as f:
            json.dump(summary, f, indent=2)
        print(f"Saved summary to {summary_path}")


async def main():
    parser = argparse.ArgumentParser(description="Export Supabase data to JSON")
    parser.add_argument("--output-dir", type=str, default="./data_export", help="Output directory")
    args = parser.parse_args()
    
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not key:
        print("Error: SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables required")
        sys.exit(1)
    
    print(f"Connecting to Supabase: {url}")
    exporter = SupabaseExporter(url, key)
    
    print("\nExporting tables...")
    await exporter.export_all()
    
    output_dir = Path(args.output_dir)
    print(f"\nSaving to {output_dir}...")
    exporter.save_to_files(output_dir)
    
    print("\nExport complete!")


if __name__ == "__main__":
    asyncio.run(main())
