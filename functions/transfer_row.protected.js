//import APIs
const { GoogleSpreadsheet } = require('google-spreadsheet');
let fs = require('fs');

let credsFile = Runtime.getAssets()['/creds.json'].path;
let creds = JSON.parse(fs.readFileSync(credsFile, 'utf8'));

//let credsFile = "C:/Users/Lenovo/Desktop/chatbot_projects/dodobot_1/dodobot-1/assets/creds.private.json"
//let creds = JSON.parse(fs.readFileSync(credsFile, {encoding:'utf8', flag:'r'}));


//access Confirm
/*const confirmSheet = doc.sheetsByIndex[2];
const confirm_rows = confirmSheet.getRows();*/

//get all items under same contact
async function getAllDraftRows(name){

    const doc = new GoogleSpreadsheet('1SU9nJTwnIC-Hd0JTR8-A9D6LSjNRQUdvP5qU5qPZszM');
    //Obtain file access with provided credentials by service account
    await doc.useServiceAccountAuth(creds);
    //Load all information (sheets, metadata) of the Google Sheets file
    await doc.loadInfo();

    //access Draft Sheet
    const draftSheet = doc.sheetsByIndex[1];
    const draft_rows = await draftSheet.getRows();

    const all_items = draft_rows.filter(row => row.contact === name);

    return all_items;

}

async function insertIntoConfirm(all_items){

    const doc = new GoogleSpreadsheet('1SU9nJTwnIC-Hd0JTR8-A9D6LSjNRQUdvP5qU5qPZszM');
    //Obtain file access with provided credentials by service account
    await doc.useServiceAccountAuth(creds);
    //Load all information (sheets, metadata) of the Google Sheets file
    await doc.loadInfo();

    //access Confirm Sheet
    const confirmSheet = doc.sheetsByIndex[2];

    for (i=0; i < all_items.length; i++){

        const new_confirm_order_row = {
            contact: all_items[i].contact,
            item_name: all_items[i].item_name,
            item_code: all_items[i].item_code,
            quantity: all_items[i].quantity
        }

        await confirmSheet.addRow(new_confirm_order_row);

    }

}

async function deleteDraftRows(name){

    const doc = new GoogleSpreadsheet('1SU9nJTwnIC-Hd0JTR8-A9D6LSjNRQUdvP5qU5qPZszM');
    //Obtain file access with provided credentials by service account
    await doc.useServiceAccountAuth(creds);
    //Load all information (sheets, metadata) of the Google Sheets file
    await doc.loadInfo();

    //access Draft Sheet
    const draftSheet = doc.sheetsByIndex[1];
    const draft_rows = await draftSheet.getRows();

    for(i=0; i<draft_rows.length; i++){

        if(draft_rows[i].contact === name){
            draft_rows[i].del();
        }

        else{
            pass;
        }

    };

}

async function mainFunction(name){

    //get all_items
    const all_items = await getAllDraftRows(name);

    //delete all rows from 
    await deleteDraftRows(name);

    //add into confirm sheet
    await insertIntoConfirm(all_items);

}

//const name = 'whatsapp:+60123242824';

//mainFunction(name);

exports.handler = async function (context, event, callback) {

    const name = event.From;

    await mainFunction(name);
    
    callback(null, mainFunction);
  
  };
