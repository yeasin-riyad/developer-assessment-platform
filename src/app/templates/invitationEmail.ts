import config from "../config/index.js";

type InvitationEmailData = {
  candidateName: string;
  assessmentTitle: string;
  duration: number;
  totalMarks: number;
  expiresAt?: Date | null;
};

export const invitationEmailTemplate = ({
  candidateName,
  assessmentTitle,
  duration,
  totalMarks,
  expiresAt,
}: InvitationEmailData) => {
  const formattedExpiry = expiresAt
    ? expiresAt.toLocaleString()
    : "No expiration date";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />

        <title>Assessment Invitation</title>
      </head>

      <body
        style="
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          background-color: #f5f7fa;
        "
      >
        <div
          style="
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            padding: 32px;
            border-radius: 12px;
          "
        >

          <h1>
            Assessment Invitation
          </h1>

          <p>
            Hello ${candidateName},
          </p>

          <p>
            You have been invited to participate in the following assessment:
          </p>

          <h2>
            ${assessmentTitle}
          </h2>

          <p>
            <strong>Duration:</strong>
            ${duration} minutes
          </p>

          <p>
            <strong>Total Marks:</strong>
            ${totalMarks}
          </p>

          <p>
            <strong>Invitation Expires:</strong>
            ${formattedExpiry}
          </p>

          <p>
            Please log in to your candidate account to accept the invitation
            and start your assessment.
          </p>

          <div style="margin: 30px 0;">
            <a
              href="${config.frontend_url}/invitations"
              style="
                background: #2563eb;
                color: #ffffff;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 8px;
                display: inline-block;
              "
            >
              View Invitation
            </a>
          </div>

          <p>
            Good luck! 🎯
          </p>

          <p>
            Developer Assessment Platform
          </p>

        </div>
      </body>
    </html>
  `;
};