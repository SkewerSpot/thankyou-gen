$(document).ready(() => {
  /**
   * Initializations.
   */
  initFormDefaults();

  /**
   * Handle form input change.
   *
   * Update `CONSTANTS` object with new values.
   */
  $('#formCustomize input[type=number]').change(function() {
    const id = $(this).attr('id');
    const newVal = $(this).val();
    CONSTANTS[id] = +newVal; // convert to number
  });

  /**
   * Handle the click event for Generate button.
   *
   * Generates front page and back page documents in corresponding iframes.
   */
  $('#formCustomize').submit(e => {
    e.preventDefault();

    if (!jsPDF) return false;

    seedUniqueCodes();

    const docFP = new jsPDF(); // front page document
    const docBP = new jsPDF(); // back page document

    createDocument(docFP, 'front');
    createDocument(docBP, 'back');

    $('#frontPdf').attr('src', docFP.output('datauristring'));
    $('#backPdf').attr('src', docBP.output('datauristring'));
  });
});

/**
 * All constants neatly wrapped in an object.
 */
const CONSTANTS = {
  numPages: 10,
  pageWidth: 210, // millimeters (A4 size)
  pageHeight: 297, // millimeters (A4 size)
  pageContentPadding: 10, // millimeters,
  numBoxesPerPage: 2,
  boxContentPadding: 20, // millimeters
  borderRadius: 3, // points
  bodyFontSize: 16, // points
  titleFontSize: 40, // points,
  smallFontSize: 13,
  textTopMargin: 10, // millimeters
  qrCodeSize: 50, // pixels (height and width),
  uniqueCodes: [],
  numCodesToCollect: 3
};

/**
 * Initializes form input fields with default constant values.
 */
function initFormDefaults() {
  $('#formCustomize input[type=number]').each(function() {
    const id = $(this).attr('id');
    const defaultVal = CONSTANTS[id];
    $(this).val(defaultVal);
  });
}

/**
 * Draws a collection of pages to document.
 *
 * A front page document contains `numPages` pages of front page matter.
 
 * A back page document contains `numPages` pages of back page matter.
 *
 * @param {jsPDF} doc The PDF document object.
 * @param {String} type Possible values: "front" and "back".
 */
function createDocument(doc, type) {
  const numPages = type === 'front' ? CONSTANTS.numPages : 1;
  let pageNumber = 1;

  do {
    createPage(doc, type);
    if (pageNumber !== numPages) doc.addPage();
  } while (pageNumber++ !== numPages);
}

/**
 * Draws page content to document.
 *
 * The front page consists of `numBoxesPerPage` thank you note boxes,
 * separated by dividing lines.
 *
 * The back page consists of `numBoxesPerPage` instruction boxes,
 * separated by dividing lines.
 *
 * @param {jsPDF} doc The PDF document object.
 * @param {String} type Possible values: "front" and "back".
 */
function createPage(doc, type) {
  const numSections = CONSTANTS.numBoxesPerPage;
  const sectionHeight = CONSTANTS.pageHeight / numSections;

  for (let i = 0; i < CONSTANTS.numBoxesPerPage; i++) {
    const offset = i * sectionHeight;
    if (i !== 0) createDividingLine(doc, offset);

    switch (type) {
      case 'front':
        createThankYouBox(doc, offset);
        break;
      case 'back':
        createInstructionsBox(doc, offset);
        break;
      default:
        return;
    }
  }
}

/**
 * Draws the border for thank you note box.
 *
 * @param {jsPDF} doc The PDF document object.
 * @param {Number} offset Number of units from document's top.
 */
function createBoxBorder(doc, offset) {
  const rectX = CONSTANTS.pageContentPadding;
  const rectY = offset + CONSTANTS.pageContentPadding;
  const rectWidth = CONSTANTS.pageWidth - CONSTANTS.pageContentPadding * 2;
  const rectHeight =
    CONSTANTS.pageHeight / CONSTANTS.numBoxesPerPage -
    CONSTANTS.pageContentPadding * 2;
  doc.roundedRect(
    rectX,
    rectY,
    rectWidth,
    rectHeight,
    CONSTANTS.borderRadius,
    CONSTANTS.borderRadius
  );
}

/**
 * Draws a horizontal dividing line in document.
 *
 * @param {jsPDF} doc The PDF document object.
 * @param {Number} offset Number of units from document's top.
 */
function createDividingLine(doc, offset) {
  const lineX1 = 0;
  const lineY1 = offset;
  const lineX2 = CONSTANTS.pageWidth;
  const lineY2 = offset;
  doc.line(lineX1, lineY1, lineX2, lineY2);
}

/**
 * Draws a single thank you note box with content.
 *
 * @param {jsPDF} doc The PDF document object.
 * @param {Number} offset Number of units from document's top.
 */
function createThankYouBox(doc, offset) {
  const code = CONSTANTS.uniqueCodes.pop();
  createBoxBorder(doc, offset);
  createThankYouBoxContent(doc, offset, code);
}

/**
 * Draws the content for thank you note box.
 *
 * @param {jsPDF} doc The PDF document object.
 * @param {Number} offset Number of units from document's top.
 * @param {String} code The unique 6-digit code.
 */
function createThankYouBoxContent(doc, offset, code) {
  createQrCode(doc, offset, code);
  createThankYouBoxHeadline(doc, offset);
  createThankYouBoxText(doc, offset, code);
}

/**
 * Draws the headline for thank you note box content.
 *
 * @param {jsPDF} doc The PDF document object.
 * @param {Number} offset Number of units from document's top.
 */
function createThankYouBoxHeadline(doc, offset) {
  const headlineX = CONSTANTS.boxContentPadding;
  const headlineY =
    offset + CONSTANTS.pageHeight / (CONSTANTS.numBoxesPerPage * 2); // center of box
  doc.setFontSize(CONSTANTS.titleFontSize);
  doc.text('Thank you for choosing us!', headlineX, headlineY);
}

/**
 * Draws the unique code text for thank you note box content.
 *
 * @param {jsPDF} doc The PDF document object.
 * @param {Number} offset Number of units from document's top.
 * @param {String} code The unique 6-digit code.
 */
function createThankYouBoxText(doc, offset, code) {
  const text1X = CONSTANTS.boxContentPadding;
  const text1Y =
    offset +
    CONSTANTS.pageHeight / (CONSTANTS.numBoxesPerPage * 2) +
    CONSTANTS.textTopMargin; // below the headline
  doc.setFontSize(CONSTANTS.bodyFontSize);
  doc.text(`Your unique code is: ${code}`, text1X, text1Y);

  const text2X = text1X;
  const text2Y = text1Y + CONSTANTS.textTopMargin; // below text1
  doc.text(
    `Collect ${CONSTANTS.numCodesToCollect} codes to win a FREE meal :)`,
    text2X,
    text2Y
  );
}

/**
 * Draws a QRCode image for the given text.
 *
 * @param {jsPDF} doc The PDF document object.
 * @param {Number} offset Number of units from document's top.
 * @param {String} text The string to encode as QRCode.
 */
function createQrCode(doc, offset, text) {
  if (!qrcode) {
    return false;
  }
  const qr = new qrcode(-1, 'M');
  qr.addData(text);
  qr.make();
  const qrImg = qr.createDataURL();
  const qrX = 5;
  const qrY = 5 + offset;
  doc.addImage(
    qrImg,
    'GIF',
    qrX,
    qrY,
    CONSTANTS.qrCodeSize,
    CONSTANTS.qrCodeSize
  );
}

/**
 * Draws a single instructions box with content.
 *
 * @param {jsPDF} doc The PDF document object.
 * @param {Number} offset Number of units from document's top.
 */
function createInstructionsBox(doc, offset) {
  createBoxBorder(doc, offset);
  createInstructionsBoxContent(doc, offset);
}

/**
 * Draws the content for instructions box.
 *
 * @param {jsPDF} doc The PDF document object.
 * @param {Number} offset Number of units from document's top.
 */
function createInstructionsBoxContent(doc, offset) {
  const instructions = [
    'Receive a unique code each time you order from:',
    'SkewerSpot, The Foodie Kitchen, or Oye Hoye! Punjabi Dhaba.',
    '',
    `${CONSTANTS.numCodesToCollect} unique codes can be redeemed for:`,
    'Amritsari Mix Naan Plate OR Pav Bhaji OR Nutri Kulcha Plate.',
    '',
    'Codes once used cannot be redeemed again.',
    '',
    '1. Open SkewerSpot menu in Zomato app.',
    '2. Add 1 "Cake Pop" to Cart. It will cost you Rs. 20.',
    '3. You may also add other items to cart.',
    '4. Click on "View Cart" button.',
    '5. On the Cart page, click on "Add cooking instructions" link.',
    `6. Enter your ${CONSTANTS.numCodesToCollect} unique codes (separated by comma).`,
    '7. Also enter your FREE meal choice from above 3 options.',
    '8. Click the "Place Order" button to finalize your order.',
    '9. Sit back and relax. You will receive your FREE meal along with ordered items.'
  ];
  const textX = CONSTANTS.boxContentPadding;
  let textY = offset + CONSTANTS.boxContentPadding;

  doc.setFontSize(CONSTANTS.smallFontSize);
  instructions.forEach(instruction => {
    doc.text(instruction, textX, textY);
    textY += 7;
  });
}

/**
 * Returns a random 6-digit code.
 */
function generateRandomCode() {
  return Math.floor(100000 + Math.random() * 900000);
}

/**
 * Initializes `uniqeCodes` array with `numPages` * `numBoxesPerPage`
 * unique and random 6-digit codes.
 */
function seedUniqueCodes() {
  const numCodes = CONSTANTS.numPages * CONSTANTS.numBoxesPerPage;
  const codeSet = new Set(); // a Set will ensure uniqueness

  while (codeSet.size !== numCodes) {
    codeSet.add(generateRandomCode().toString());
  }

  CONSTANTS.uniqueCodes = Array.from(codeSet);
}
