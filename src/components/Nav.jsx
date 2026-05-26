export default function Nav({ auth }) {
  const { user, signInWithGoogle, signOut } = auth

  return (
    <nav>
      <a href="#" className="nav-logo">
        Know<span>Your</span>Solar
      </a>

      {user ? (
        <div className="nav-user">
          <img
            className="nav-avatar"
            src={user.user_metadata?.avatar_url || ''}
            alt=""
            referrerPolicy="no-referrer"
          />
          <span className="nav-user-name">
            {user.user_metadata?.full_name || user.email}
          </span>
          <button className="nav-signout" onClick={signOut}>
            Sign out
          </button>
        </div>
      ) : (
        <a href="#upload" className="nav-cta">
          Start Analysis
        </a>
      )}
    </nav>
  )
}
