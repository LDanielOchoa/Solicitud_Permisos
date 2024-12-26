'use server'

import { enviarCorreo } from './emailServer';

export async function sendEmail(requestId: string, action: 'approve' | 'reject', reason: string, userEmail: string) {
  if (!userEmail) {
    console.error('User email not provided. Unable to send email.');
    return;
  }

  const subject = `Request ${requestId} ${action === 'approve' ? 'Approved' : 'Rejected'}`;
  const text = `The request ${requestId} has been ${action === 'approve' ? 'approved' : 'rejected'}.
  
Reason: ${reason}`;

  try {
    await enviarCorreo(userEmail, subject, text);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}

