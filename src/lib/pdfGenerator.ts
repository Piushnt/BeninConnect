import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as QRCode from 'qrcode';

interface DocumentData {
  tracking_code: string;
  citizen_name: string;
  service_name: string;
  municipality_name: string;
  submission_date: string;
  signature_hash: string;
  signer_name: string;
  qr_code_data: string;
}

export const generateOfficialPDF = async (data: DocumentData): Promise<Blob> => {
  // Create a temporary hidden container for the document
  const container = document.createElement('div');
  container.id = 'temp-pdf-container';
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '800px';
  container.style.padding = '60px';
  container.style.background = 'white';
  container.style.color = '#111';
  container.style.fontFamily = "'Inter', sans-serif";
  container.style.lineHeight = '1.6';

  container.innerHTML = `
    <div style="border: 2px solid #000; padding: 40px; position: relative; min-height: 1000px;">
      <!-- Watermark Background -->
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; opacity: 0.03; pointer-events: none; z-index: 0;">
        <div style="width: 500px; height: 500px; border-radius: 50%; background: linear-gradient(135deg, #008751 0%, #FCD116 50%, #E8112D 100%);"></div>
      </div>

      <!-- Header -->
      <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 40px; position: relative; z-index: 1;">
        <div style="font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">RÉPUBLIQUE DU BÉNIN</div>
        <div style="font-size: 10px; font-weight: 600; color: #666; margin-bottom: 20px;">FRATERNITÉ • JUSTICE • TRAVAIL</div>
        
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="text-align: left;">
            <div style="font-weight: 800; font-size: 12px; text-transform: uppercase;">MINISTÈRE DE LA DÉCENTRALISATION</div>
            <div style="font-weight: 700; font-size: 11px; text-transform: uppercase;">MAIRIE DE ${data.municipality_name}</div>
          </div>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Coat_of_arms_of_Benin.svg/200px-Coat_of_arms_of_Benin.svg.png" style="width: 80px; height: auto;" />
          <div style="text-align: right;">
             <div style="font-size: 10px; font-weight: 700;">CODE DE TRAÇABILITÉ</div>
             <div style="font-weight: 800; font-size: 14px; font-family: monospace;">${data.tracking_code}</div>
          </div>
        </div>
      </div>

      <!-- Title -->
      <div style="text-align: center; margin-bottom: 50px; position: relative; z-index: 1;">
        <h1 style="text-transform: uppercase; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; border-bottom: 4px solid #FCD116; display: inline-block; padding-bottom: 5px;">
          ACTE ADMINISTRATIF OFFICIEL
        </h1>
      </div>

      <!-- Content -->
      <div style="font-size: 14px; position: relative; z-index: 1;">
        <p>Le Maire de la commune de <strong>${data.municipality_name}</strong> certifie par la présente que :</p>
        
        <div style="margin: 30px 0; padding: 20px; background: #f9f9f9; border-left: 5px solid #008751;">
          <div style="margin-bottom: 10px;">TITULAIRE : <strong style="text-transform: uppercase; font-size: 16px;">${data.citizen_name}</strong></div>
          <div style="margin-bottom: 10px;">OBJET : <strong>${data.service_name}</strong></div>
          <div>DATE DE DÉLIVRANCE : <strong>${data.submission_date}</strong></div>
        </div>

        <p style="text-align: justify; text-indent: 40px;">
          Ce document atteste de la validation du dossier de l'intéressé(e) après vérification conforme des pièces fournies et enregistrement dans le Registre National de l'Administration Numérique. Il conserve toute sa valeur probante par rapport aux registres physiques tenus par les services compétents.
        </p>
      </div>

      <!-- Legal Notice -->
      <div style="margin-top: 60px; font-size: 10px; font-style: italic; color: #555; position: relative; z-index: 1;">
        "Ce document est signé numériquement et vaut original conformément à la loi sur le numérique en République du Bénin."
      </div>

      <!-- Footer / Signature Part -->
      <div style="margin-top: 80px; display: flex; justify-content: space-between; align-items: flex-end; position: relative; z-index: 1;">
        <div style="width: 150px; text-align: center;">
          <div id="qr-code-placeholder" style="width: 120px; height: 120px; margin: 0 auto; background: #eee; border: 1px solid #ddd; display: flex; align-items: center; justify-content: center;">
            QR CODE
          </div>
          <div style="font-size: 9px; font-weight: 800; margin-top: 10px; color: #666;">SCANNER POUR VÉRIFIER</div>
        </div>

        <div style="text-align: right;">
          <div style="margin-bottom: 5px; font-size: 12px; font-weight: 700;">Fait à ${data.municipality_name}, le ${data.submission_date}</div>
          <div style="font-weight: 800; font-size: 14px; text-transform: uppercase;">Le Maire / L'Autorité Signataire</div>
          <div style="margin-top: 15px; color: #008751; font-weight: 700;">${data.signer_name}</div>
          <div style="margin-top: 5px; font-size: 9px; color: #999; font-family: monospace;">EMPREINTE : ${data.signature_hash.substring(0, 16)}...</div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  // Use QRCode.toCanvas or similar if we had it, but here we'll assume we pass an image URL 
  // or use the placeholder and replace it with a rendered dataURL before canvas conversion.
  // Generate QR code as data URL
  const qrDataUrl = await QRCode.toDataURL(data.qr_code_data, {
    margin: 1,
    width: 150,
    color: {
      dark: '#111',
      light: '#ffffff'
    }
  });

  const qrPlaceholder = document.getElementById('qr-code-placeholder');
  if (qrPlaceholder) {
    qrPlaceholder.innerHTML = `<img src="${qrDataUrl}" style="width: 100%;" />`;
  }

  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff'
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  
  document.body.removeChild(container);
  
  return pdf.output('blob');
};
