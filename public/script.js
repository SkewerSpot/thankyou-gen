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
   */
  $('#formCustomize').submit(async e => {
    e.preventDefault();
    await generatePDFs(false);
  });

  /**
   * Handle the click event for Test button.
   */
  $('#btnTest').click(async e => {
    e.preventDefault();
    await generatePDFs(true);
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
  numCodesToCollect: 3,
  uniqeCodeValidUntil: 'February 29, 2020',
  brandLogoHeight: 15, // millimeters
  brandLogoGap: 5, // millimeters
  freebies: [
    'Amritsari Mix Naan Plate',
    'Pav Bhaji',
    'Nutri Kulcha Plate',
    'Arrabiata Pasta',
    'Veg Chowmein',
    'Brownie'
  ]
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
 * Generates front page and back page documents in corresponding iframes.
 *
 * @param {Boolean} withDummyCodes If true, dummy codes will be generated instead of getting from db.
 */
async function generatePDFs(withDummyCodes) {
  if (!jsPDF) return false;

  await seedUniqueCodes(withDummyCodes);

  const docFP = new jsPDF(); // front page document
  const docBP = new jsPDF(); // back page document

  createDocument(docFP, 'front');
  createDocument(docBP, 'back');

  $('#frontPdf').attr('src', docFP.output('datauristring'));
  $('#backPdf').attr('src', docBP.output('datauristring'));
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
  createBrandLogos(doc, offset);
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
  doc.text(`Your unique code is: ${code}*`, text1X, text1Y);

  const text2X = text1X;
  const text2Y = text1Y + CONSTANTS.textTopMargin; // below text1
  doc.text(
    `Collect ${CONSTANTS.numCodesToCollect} codes to win a FREE meal :)`,
    text2X,
    text2Y
  );

  doc.setFontSize(CONSTANTS.smallFontSize);

  const text3X = text1X;
  const text3Y = text2Y + CONSTANTS.textTopMargin * 3; // below text2
  doc.setFontStyle('bolditalic');
  doc.text(`Valid until ${CONSTANTS.uniqeCodeValidUntil}`, text3X, text3Y);

  const text4X = text1X;
  const text4Y = text3Y + CONSTANTS.textTopMargin / 2; // below text3
  doc.setFontStyle('normal');
  doc.text('* Code once used CANNOT be used again.', text4X, text4Y);
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
    'SkewerSpot // The Foodie Kitchen (TFK) // Oye Hoye! Punjabi Dhaba (OHPD)',
    '',
    `Send us ${CONSTANTS.numCodesToCollect} unique codes in your next order to get 1 FREE meal:`,
    ...CONSTANTS.freebies.reduce((splitArr, freebie, index) => {
      splitArr[Math.floor(index / 3)] +=
        `(${freebie})` +
        (index !== CONSTANTS.freebies.length - 1 ? ' OR ' : '');
      return splitArr;
    }, Array(Math.ceil(CONSTANTS.freebies.length / 3)).fill('')), // split into 3 freebies per line
    '',
    ['Codes once used cannot be redeemed again.', 'bold'],
    '',
    '1. Start creating your next Zomato order from SkewerSpot or TFK or OHPD.',
    '2. Once you have added desired items to cart, click on "View Cart" button.',
    '3. On the Cart page, click on "Add cooking instructions" link.',
    `4. Enter your ${CONSTANTS.numCodesToCollect} unique codes (separated by comma).`,
    `5. Also enter your FREE meal choice from above ${CONSTANTS.freebies.length} options.`,
    '6. Click the "Place Order" button to finalize your order.',
    '7. Sit back and relax. You will receive your FREE meal along with ordered items.'
  ];
  const textX = CONSTANTS.boxContentPadding;
  let textY = offset + CONSTANTS.boxContentPadding;

  doc.setFontSize(CONSTANTS.smallFontSize);

  instructions.forEach(instruction => {
    let text,
      fontStyle = 'normal';
    if (typeof instruction === 'string') {
      text = instruction;
    } else if (Array.isArray(instruction)) {
      text = instruction[0];
      // For possible values, check:
      // http://raw.githack.com/MrRio/jsPDF/master/docs/jsPDF.html#setFontStyle
      // Most common values will be "normal", "bold", "italic"
      fontStyle = instruction[1];
    }
    doc.setFontStyle(fontStyle);
    doc.text(text, textX, textY);
    textY += 7;
  });

  doc.setFontStyle('italic');
  doc.text(
    'Your review on Zomato will mean a world to us :)',
    CONSTANTS.pageWidth - CONSTANTS.pageContentPadding - 2,
    textY,
    null,
    90
  );
}

/**
 * Draws logos of all our brands.
 *
 * @param {jsPDF} doc The PDF document object.
 * @param {Number} offset Number of units from document's top.
 */
function createBrandLogos(doc, offset) {
  const y = 20 + offset;

  // SkewerSpot logo
  const ssImgEl = document.getElementById('logoSS');
  const ssDataUri = getDataUri(ssImgEl);
  const ssHeight = CONSTANTS.brandLogoHeight - 4; // default logo height makes it too wide
  const ssWidth = ssImgEl.naturalWidth * (ssHeight / ssImgEl.naturalHeight);
  const ssX = CONSTANTS.qrCodeSize + CONSTANTS.brandLogoGap;
  const ssY = y + 2; // slight adjustment because of non-default height
  doc.addImage(ssDataUri, 'PNG', ssX, ssY, ssWidth, ssHeight);

  // The Foodie Kitchen logo
  const tfkImgEl = document.getElementById('logoTFK');
  const tfkDataUri = getDataUri(tfkImgEl);
  const tfkHeight = CONSTANTS.brandLogoHeight;
  const tfkWidth = tfkImgEl.naturalWidth * (tfkHeight / tfkImgEl.naturalHeight);
  const tfkX = ssX + ssWidth + CONSTANTS.brandLogoGap;
  const tfkY = y;
  doc.addImage(tfkDataUri, 'PNG', tfkX, tfkY, tfkWidth, tfkHeight);

  // Oye Hoye Punjabi Dhaba logo
  const ohpdImgEl = document.getElementById('logoOHPD');
  const ohpdDataUri = getDataUri(ohpdImgEl);
  const ohpdHeight = CONSTANTS.brandLogoHeight;
  const ohpdWidth =
    ohpdImgEl.naturalWidth * (ohpdHeight / ohpdImgEl.naturalHeight);
  const ohpdX = tfkX + tfkWidth + CONSTANTS.brandLogoGap;
  const ohpdY = y;
  doc.addImage(ohpdDataUri, 'PNG', ohpdX, ohpdY, ohpdWidth, ohpdHeight);
}

/**
 * Initializes `uniqeCodes` array with `numPages` * `numBoxesPerPage`
 * unique and random 6-digit codes.
 *
 * @param isDummy {Boolean} Whether dummy codes should be returned.
 */
async function seedUniqueCodes(isDummy) {
  const numCodes = CONSTANTS.numPages * CONSTANTS.numBoxesPerPage;

  let apiUrl = `/api/unique-codes?count=${numCodes}`;
  if (isDummy) apiUrl += '&dummy=true';
  const response = await fetch(apiUrl);
  const codes = await response.json();

  if (!Array.isArray(codes)) codes = [];

  if (codes.length < numCodes) {
    for (i = codes.length; i < numCodes; i++) {
      codes[i] = '';
    }
  }

  CONSTANTS.uniqueCodes = codes;
}

/**
 * Returns base64 data URI representation for given image.
 *
 * Based on code at https://davidwalsh.name/convert-image-data-uri-javascript.
 *
 * We are not using the `img.onload` technique to avoid async code.
 *
 * @param {HTMLImageElement} img DOM object of a loaded image element.
 */
function getDataUri(img) {
  if (!('nodeName' in img && img.nodeName === 'IMG')) {
    throw new Error('The given image is not a valid HTML IMG element.');
  }

  var canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth; // or 'width' if you want a special/scaled size
  canvas.height = img.naturalHeight; // or 'height' if you want a special/scaled size

  canvas.getContext('2d').drawImage(img, 0, 0);

  return canvas.toDataURL('image/png');
}
