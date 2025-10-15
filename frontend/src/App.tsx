import React from 'react';
import FeedbackForm from './components/FeedbackForm';

export default function App() {
  return (
    <div className="container">
      <div className="card">
        <h1>Feedback App</h1>
        <p>Submit your feedback below. We value your thoughts.</p>
        <FeedbackForm />
      </div>
    </div>
  );
}