
import { createTransport } from 'nodemailer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const MailContents = {
  proforma: `
            <div
          
            style="max-width: 90%; margin: auto; margin-top: 15px "
          >
            <p style="color:black"> Dear Sir/Madam,</p>
            <p style="color:black">
            
        Note : Please review Proforma invoice and advise immediately if any amendment is required.
        Otherwise we assume it is accepted. Final invoice amount may vary from
        Proforma invoice as per actual testing or exchange rate fluctuation.</p>
        <p style="color:black">
        Please provide your GSTIN details for our records as soon as possible to raise invoice until then
        your invoice will be kept on hold. if already provided kindly ignore this request.
        </p>
        <p style="color:black">
        SRG Apparels Limited –Textile Testing Laboratory - <span> GST Prov.ID: </span> 33AADCS8162K1Z4
        </p>
        <h3 style="font-bold; color:black">
        Our Bank Details:
        </h3>
        <div style="max-width: 90%; margin: auto; margin-top: 10px ">
        <p style="color:black">Account Name: SRG APPARELS LIMITED </p>
        <p style="color:black">Account No: 3811669213 </p>
        <p style="color:black">IFSC Code: KKBK0000492 </p>
        <p style="color:black"> Branch: TIRUPUR. </p>
        </div>

        <div style="color:black">
        <p style:"font-size:13">  Thanks &amp; Regards, </p>
        <p style="color:green">  Shenbagasundaram .S  </p>
        <p style="color:black">  Manager-Textile Testing Laboratory  </p>
        <p style="color:black">  8870275533  </p>
        <p style="color:black"> The Laboratory has been accredited as per ISO/IEC 17025:2017 in chemical &amp; mechanical fields of Textile Testing. To know the Scope of
        accreditation, visit www.nabl-india.org [nabl-india.org] certificate no. TC10916   </p>
        </div>

            
        </div>`,

  testReport: `
          <div
          style="max-width: 90%; margin: auto; margin-top: 15px; color:black"
          >
          <p style:"font-size:13"> Dear All, </p>
          <p style:"font-size:9">Please find the attached test report for your review. </p>
          <div>
          <p style:"font-size:13">  Thanks &amp; Regards, </p>
          <p style="color:green">  Shenbagasundaram .S  </p>
          <p>  Manager-Textile Testing Laboratory  </p>
          <p>  8870275533  </p>
          <p> The Laboratory has been accredited as per ISO/IEC 17025:2017 in chemical &amp; mechanical fields of Textile Testing. To know the Scope of
          accreditation, visit www.nabl-india.org [nabl-india.org] certificate no. TC10916   </p>
          </div>


          </div>

`,
  invoiceReport: `
                <div

              style="max-width: 90%; margin: auto; margin-top: 15px color:black"
              >
                <p style:"font-size:13">  Dear Sir / Madam,  </p>
                <p style:"font-size:13 margin-top:5px">Kindly find herewith the attached final Invoice for the sample submitted for 
                testing : </p>
                <p>Lab Report. No. : - SRG24040001 </p>
                <p>Kindly confirm the receipt. </p>
                <div  style:"font-size:13 margin-top:5px">
                <p>Thanks &amp; Regards,  </p>
                <p style="color:green">Shenbagasundaram .S </p>
                <p>Manager-Textile Testing Laboratory </p>
                <p>8870275533 </p>
                <p>The Laboratory has been accredited as per ISO/IEC 17025:2017 in chemical &amp; mechanical fields of Textile Testing. To know the Scope of
              accreditation, visit www.nabl-india.org [nabl-india.org] certificate no. TC10916 </p>
              </div>


              </div>
                `,

  sampleAcknowledgement: `
              <div
            style="max-width: 90%; margin: auto; margin-top: 15px "
            >
              <p style:"color:black"> Dear Sir / Madam, </p>
              <p style:"color:black">We have received your sample for testing. </p>
              <p style:"font-size:13; margin-top:5px; color:black">Please review the above information and advice immediately if any amendment is required. 
              >For any queries, please feel free to contact our Customer Service Representative. (Mobile
            Number: 9677706626)  </p>
            <p style:"color:black">Thank you for submitting the sample(s) to SRG Apparels Limited- Textile Testing
            Laboratory for testing  </p>
            <div  style:"font-size:13; margin-top:5px; color:black">
            <p style="color:black">Thanks &amp; Regards,  </p>
            <p style="color:green">Shenbagasundaram .S </p>
            <p style="margin-top:-5px ;color:black">Manager-Textile Testing Laboratory </p>
            <p style="margin-top:-5px; color:black"> 8870275533 </p>
            <p style="color:black"> The Laboratory has been accredited as per ISO/IEC 17025:2017 in chemical &amp; mechanical fields of Textile Testing. To know the Scope of
            accreditation, visit www.nabl-india.org [nabl-india.org] certificate no. TC10916  </p>
            </div>

            </div>

              `,
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let MAIL_SETTINGS = {};

export async function sendMailWithAttachmentWithMultipleFiles(req) {


  console.log(req.body, "req")

  MAIL_SETTINGS = {
    service: 'gmail',
    auth: {
      user: "pinnacle.systems.ps@gmail.com",
      // req?.body?.FromAddresss,
      pass: "cfim ylyo teby zdia"
      //  req?.body?.passskey

    }
  }

  const transporter = createTransport(MAIL_SETTINGS);

  console.log(req.body.ccList, 'cc');


  let FromAddresss = req?.body?.FromAddresss
  let ToAddress = req?.body?.ToAddresss
  let subject = req?.body?.subject;
  let ccAddress = req.body.ccList;
  let message = req?.body?.message;
  let fileName = req.body.fileName


  try {
    const files = req?.body?.attachments

    console.log(files, "filesss")

    let attachments = [
      {
        filename: `${fileName}`,
        path: `./uploads/${fileName}`,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    ]

    files?.forEach(file => {

      attachments.push(
        {
          filename: `${file}`,
          path: `./uploads/${file}`,
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
      )
    })




    let info = await transporter.sendMail({
      from: MAIL_SETTINGS.auth.user,
      to: ToAddress,
      cc: ccAddress,
      subject: subject,
      attachments: attachments?.filter(val => val?.filename !== "undefined"),
      html: `${message}
            <img src="cid:logo" alt="PNG Image" />`
    });
    return { success: true, message: " send email with multiple Files ", info };;
  } catch (error) {
    console.error("Error sending mail:", error);

  }

}
























// export async function sendMailWithAttachmentWithMultipleFiles(req) {

//    MAIL_SETTINGS = {
//     service: 'gmail',
//     auth: {
//         user: "iridescentcosting@gmail.com",
//         // req?.body?.FromAddresss,
//         pass:   "qowiqsbixattwtmw"  
//         //  req?.body?.passskey

//   }
// }
//     console.log(MAIL_SETTINGS,'MAIL_SETTINGS')
// const transporter = createTransport(MAIL_SETTINGS);



//   let FromAddresss = req?.body?.FromAddresss
//   let ToAddress = req?.body?.ToAddresss
//   let subject = req?.body?.subject;
//   let ccAddress;
//   let message  =  req?.body?.message;






//   let content;


//   if (req.body.subject == "DocumentProFormaInvoice") {
//     content = MailContents.proforma
//   }
//   else if (req.body.subject == "InvoiceDocument") {
//     content = MailContents.invoiceReport
//   }
//   else if (req.body.subject == "Sample Acknowledgement") {
//     content = MailContents.sampleAcknowledgement
//   }
//   else {
//     content = MailContents.testReport
//   };

//   try {
//     const fileName =  req?.body?.fileName;

//     const files = req.files;
//     // const attachments = [
//     //   {
//     //     filename: req?.body?.fileName,
//     //     path: "/uploads/1746509275454Order_1746509275403.xlsx",
//     //     cid: "logo"
//     //   }
//     // ]
//     let info = await transporter.sendMail({
//       from: MAIL_SETTINGS.auth.user,
//       to: ToAddress,
//       cc: ccAddress,

//       subject: subject,
//       // attachments,
//       html: `${message}
//            <img src="cid:logo" alt="PNG Image" />`
//     });
//     return   { success: true, message: " send email with multiple Files ", info };;
//   } catch (error) {
//     console.error("Error sending mail:", error);

//   }
// }




export async function sendMail(params) {
  try {
    let info = await transporter.sendMail({
      from: MAIL_SETTINGS.auth.user,
      to: params.to,
      subject: 'PASSWORD RESET ✔',
      html: `
        <div
          class="container"
          style="max-width: 90%; margin: auto; padding-top: 20px"
        >
          <h2>SRG LIMS System</h2>
          <h4>OTP for Reset Password ✔</h4>
          <h1 style="font-size: 40px; letter-spacing: 2px; text-align:center;">${params.OTP}</h1>
     </div>
      `,
    });
    return info;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function sendMailWithAttachment(req) {

  let mailAddress = req.body.ToAddress?.split(",")
  let mainAddress = mailAddress[0]
  let subject = req.body.subject;
  let ccAddress = mailAddress.length > 1 ? mailAddress.map((i, index) => {


    if (index == 0) {

      return
    }
    else {

      return i
    }
  }) : []


  let content;



  if (req.body.heading == "DocumentProFormaInvoice") {
    content = MailContents.proforma
  }
  else if (req.body.heading == "InvoiceDocument") {
    content = MailContents.invoiceReport
  }
  else if (req.body.heading == "Sample Acknowledgement") {
    content = MailContents.sampleAcknowledgement
  }
  else {
    content = MailContents.testReport
  };

  try {
    let info = await transporter.sendMail({
      from: MAIL_SETTINGS.auth.user,
      to: mainAddress,
      cc: ccAddress,
      subject: req.body.subject,

      //   attachments: [
      //     {
      //       filename: `${req.body.fileName}.${"pdf"}`,
      //       content: req?.file?.buffer,
      //     }, {
      //       filename: "logo.png",
      //       path: "./src/assets/srgmaillogo.png",
      //       cid: "logo"
      //     }
      //   ],

      html: `${content}
           <img src="cid:logo" alt="PNG Image" />`



    });
    return info;
  } catch (error) {

    return false
  }
}




