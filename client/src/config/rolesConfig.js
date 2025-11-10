export const rolePermissions = {
  viewer: [
    'view_posts'
  ],
  editor: [
    'view_posts',
    'create_posts',
    'edit_own_posts'
  ],
  admin: [
    'view_posts',
    'create_posts',
    'edit_own_posts',
    'edit_any_post',
    'delete_posts',
    'access_admin_dashboard'
  ]
};

export const actionLabels = {
  view_posts: 'View Posts',
  create_posts: 'Create Posts',
  edit_own_posts: 'Edit Own Posts',
  edit_any_post: 'Edit Any Post',
  delete_posts: 'Delete Posts',
  access_admin_dashboard: 'Admin Dashboard'
};

export function hasPermission(role, action) {
  return rolePermissions[role]?.includes(action);
}
