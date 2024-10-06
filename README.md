Real-Time Functionality Implementation
The real-time collaboration feature is built using WebSocket. When a user edits a note, the changes are captured and sent to the WebSocket server. The server then broadcasts these changes to all users connected to the same room, allowing everyone to see updates instantly. This ensures a smooth collaborative experience.

Additionally, notifications inform users when someone joins or leaves the room, keeping everyone updated on the current participants.

Challenges Faced
Syncing Text Between Users: Initially, I faced difficulties ensuring that the changes made by one user were immediately visible to others. The text wasn’t updating as expected, which created confusion. I resolved this by refining how the editor content was updated and synchronized across users.

WebSocket Connection Problems: I encountered issues with the WebSocket connection occasionally failing or disconnecting unexpectedly, especially when multiple users were connected. I worked on enhancing error handling to manage these scenarios and implemented automatic reconnection attempts to ensure a stable connection.

