export const printTokenSlip = (
  clinicName: string,
  tokenNumber: number,
  patientName: string,
  chiefComplaint: string,
  estWaitMinutes: number
) => {
  const printWindow = window.open('', '_blank', 'width=450,height=600');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Token #${tokenNumber} Receipt</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 20px;
            color: #1f2937;
            background: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            box-sizing: border-box;
          }
          
          .receipt {
            border: 2px dashed #9ca3af;
            padding: 24px;
            border-radius: 8px;
            width: 320px;
            text-align: center;
            background: #ffffff;
          }
          
          .clinic-name {
            font-size: 20px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 4px;
          }
          
          .sub {
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 16px;
          }
          
          .divider {
            border-top: 1px dashed #cbd5e1;
            margin: 16px 0;
          }
          
          .token-label {
            font-size: 12px;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          
          .token-number {
            font-size: 64px;
            font-weight: 800;
            color: #2563eb;
            margin: 8px 0;
            font-family: monospace;
          }
          
          .info-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            font-size: 14px;
          }
          
          .info-label {
            color: #64748b;
          }
          
          .info-value {
            font-weight: 600;
            color: #0f172a;
          }
          
          .est-wait {
            background-color: #f1f5f9;
            border-radius: 6px;
            padding: 10px;
            margin-top: 16px;
            font-size: 13px;
            color: #334155;
          }
          
          .est-wait strong {
            color: #2563eb;
          }
          
          .note {
            font-size: 12px;
            font-weight: 500;
            color: #ef4444;
            margin-top: 20px;
          }
          
          .footer {
            font-size: 10px;
            color: #94a3b8;
            margin-top: 16px;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="clinic-name">${clinicName}</div>
          <div class="sub">Clinic Queue Receipt</div>
          <div class="divider"></div>
          
          <div class="token-label">Your Token Number</div>
          <div class="token-number">#${tokenNumber}</div>
          
          <div class="divider"></div>
          
          <div class="info-row">
            <span class="info-label">Name:</span>
            <span class="info-value">${patientName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Chief Complaint:</span>
            <span class="info-value">${chiefComplaint}</span>
          </div>
          
          <div class="est-wait">
            Estimated Wait: <strong>~${estWaitMinutes} min</strong>
          </div>
          
          <div class="note">
            ⚠️ Please do not leave the premises
          </div>
          
          <div class="footer">
            Queue Cure '26 · Realtime Queue System
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 1000);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
