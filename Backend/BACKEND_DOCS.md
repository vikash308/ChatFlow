# ChatFlow Backend Documentation

This document outlines the database schema and entity relationships for the ChatFlow backend.

## Entity Relationship (ER) Diagram

```mermaid
erDiagram
    USER ||--o{ MESSAGE : sends
    USER ||--o{ MESSAGE : receives
    USER ||--o{ CONVERSATION : member_of
    CONVERSATION ||--o{ MESSAGE : contains

    USER {
        ObjectId id PK
        string fullname
        string email UK
        string password
        boolean isVerified
        string emailOtp
        date emailOtpExpiry
        date createdAt
        date updatedAt
    }

    MESSAGE {
        ObjectId id PK
        ObjectId senderId FK
        ObjectId receiverId FK
        string message
        boolean isRead
        boolean isDeleted
        ObjectIdArray deletedFor
        date createdAt
    }

    CONVERSATION {
        ObjectId id PK
        ObjectIdArray members FK
        ObjectIdArray messages FK
        date createdAt
        date updatedAt
    }
```

## Architecture Overview
- **Node.js & Express**: Core API framework.
- **MongoDB & Mongoose**: NoSQL database for flexible chat data storage.
- **Socket.io**: Handled via a dedicated `SocketIO/server.js` to manage real-time event broadcasting and user online status tracking.
- **JWT Authentication**: Secure stateless authentication for all message and user endpoints.
