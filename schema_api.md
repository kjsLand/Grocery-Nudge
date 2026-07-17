Method  Path    Auth?   Body / Params   Notes
POST    /api/auth/register  No  { email, password, phone }  409 if email exists, sets session cookie
POST    /api/auth/login No  { email, password } Sets session cookie
POST    /api/auth/logout    Yes —   Clears session cookie
GET     /api/auth/me    Yes —   Returns current user
GET     /api/groups  No  —   Lists all groups
POST    /api/groups Yes { title }   409 on duplicate title for that leader
GET     /api/groups/mine    Yes —   Groups the signed-in user belongs to
GET     /api/groups/:id  No  —   doesn't return members (the bug from your last session)
DELETE  /api/groups/:id Yes —   403 if not a member
GET     /api/groups/:id/members No  —   Returns array of userIds
POST    /api/groups/:id/members Yes —   Join group, 409 if already a member
DELETE  /api/groups/:id/members Yes —   Leave group, 400 if not a member
GET     /api/invites Yes —   Invites for current user
POST    /api/invites    Yes { group_id, number }    Looks up user by phone number
DELETE  /api/invites/:id    Yes —   403 if not invite owner