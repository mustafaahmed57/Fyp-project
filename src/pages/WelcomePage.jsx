import React from 'react';

function WelcomePage() {
  // You can use context or local storage to show user info if needed
  const user = JSON.parse(localStorage.getItem('loggedInUser'));

  return (
    <div className="welcome-page p-8 text-center">
      <h1 className="text-3xl font-bold mb-4">
        Welcome, {user?.fullName || 'User'} 👋
      </h1>
      <p className="text-xl">
        You are logged in as <strong>{user?.role}</strong>
      </p>
      <p className="mt-4 text-gray-600">
        Please use the sidebar to explore your module features.
      </p>
    </div>
  );
}

export default WelcomePage;
