"""
Direct messaging models.
"""
from typing import Optional
from datetime import datetime
from sqlalchemy import String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin


class Message(Base, TimestampMixin):
    """Direct message between users."""
    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    
    # Participants
    sender_id: Mapped[str] = mapped_column(
        String(255),
        ForeignKey("profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    recipient_id: Mapped[str] = mapped_column(
        String(255),
        ForeignKey("profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Content
    content: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Context (optional - message about a product)
    product_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("products.id", ondelete="SET NULL"),
        nullable=True
    )
    
    # Read status
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    read_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    # Relationships
    sender = relationship("Profile", foreign_keys=[sender_id], back_populates="sent_messages")
    recipient = relationship("Profile", foreign_keys=[recipient_id], back_populates="received_messages")
    product = relationship("Product")

    def mark_as_read(self) -> None:
        """Mark message as read."""
        if not self.is_read:
            self.is_read = True
            self.read_at = datetime.utcnow()

    def __repr__(self) -> str:
        return f"<Message(id={self.id}, sender={self.sender_id})>"


class Conversation(Base):
    """Conversation thread between two users."""
    __tablename__ = "conversations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    
    # Participants (always sorted for uniqueness)
    user1_id: Mapped[str] = mapped_column(
        String(255),
        ForeignKey("profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    user2_id: Mapped[str] = mapped_column(
        String(255),
        ForeignKey("profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Last message preview
    last_message_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("messages.id", ondelete="SET NULL"),
        nullable=True
    )
    last_message_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), index=True)
    last_message_preview: Mapped[Optional[str]] = mapped_column(String(255))
    
    # Unread counts
    user1_unread: Mapped[int] = mapped_column(default=0)
    user2_unread: Mapped[int] = mapped_column(default=0)

    # Relationships
    user1 = relationship("Profile", foreign_keys=[user1_id])
    user2 = relationship("Profile", foreign_keys=[user2_id])
    last_message = relationship("Message")
    messages = relationship("Message", 
        primaryjoin="or_(Message.sender_id == Conversation.user1_id, Message.recipient_id == Conversation.user1_id)",
        viewonly=True
    )

    def __repr__(self) -> str:
        return f"<Conversation(id={self.id})>"
