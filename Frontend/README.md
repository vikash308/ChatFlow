# ChatFlow Frontend Documentation

This document outlines the architecture and data flow of the ChatFlow frontend application.

## Data Flow Diagram (DFD)

```mermaid
graph TD
    User((User))
    
    subgraph Frontend_App [ChatFlow React App]
        AuthProcess[Authentication Process]
        ChatProcess[Chat Management]
        SocketProcess[Real-time Socket Listener]
        ZustandStore[(Zustand State)]
        LocalStorage[(LocalStorage)]
    end
    
    APIServer[Backend API Server]
    SocketServer[Socket.io Server]
    
    %% Authentication Flow
    User -->|Credentials| AuthProcess
    AuthProcess -->|POST /login| APIServer
    APIServer -->|JWT & User Data| AuthProcess
    AuthProcess -->|Store Token| LocalStorage
    AuthProcess -->|Set AuthUser| ZustandStore
    
    %% Chat Flow
    User -->|Select User| ChatProcess
    ChatProcess -->|GET /messages/:id| APIServer
    APIServer -->|Message History| ChatProcess
    ChatProcess -->|Update Messages| ZustandStore
    
    %% Message Sending
    User -->|Type & Send| ChatProcess
    ChatProcess -->|POST /send/:id| APIServer
    ChatProcess -->|Emit typing| SocketServer
    
    %% Real-time Flow
    SocketServer -->|newMessage| SocketProcess
    SocketServer -->|typingIndicator| SocketProcess
    SocketServer -->|messagesSeen| SocketProcess
    SocketProcess -->|Update State| ZustandStore
    SocketProcess -->|Show Notification| User
```

## Key Components
- **Zustand**: Manages global state for conversations and messages.
- **SocketContext**: Provides a global socket instance for real-time events.
- **useGetSocketMessage**: Custom hook that handles all incoming socket events (Seen, Deleted, Typing, New Message).
- **Glassmorphic UI**: Custom CSS system defined in `index.css` using backdrop-filters and indigo-violet gradients.
