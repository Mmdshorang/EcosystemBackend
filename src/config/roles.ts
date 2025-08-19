const allRoles = {
    admin: ['manageUsers', 'manageTeams', 'viewForums'],
    team_leader: ['manageTeam', 'viewForums'],
    member: ['viewForums'],
    forum_leader: ['manageForum', 'viewForums'],
  };
  
  export const roles = Object.keys(allRoles);
  export const roleRights = new Map(Object.entries(allRoles));
  