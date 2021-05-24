const { GoogleSpreadsheet } = require('google-spreadsheet');
let fs = require('fs');

let credsFile = Runtime.getAssets()['/creds.json'].path;
let creds = JSON.parse(fs.readFileSync(credsFile, 'utf8'));

//let credsFile = "C:/Users/Lenovo/Desktop/chatbot_projects/dodobot_1/dodobot-1/assets/creds.private.json"
//let creds = JSON.parse(fs.readFileSync(credsFile, {encoding:'utf8', flag:'r'}));


async function deleteDraftRows(name){

    const doc = new GoogleSpreadsheet('1SU9nJTwnIC-Hd0JTR8-A9D6LSjNRQUdvP5qU5qPZszM');
    //Obtain file access with provided credentials by service account
    await doc.useServiceAccountAuth(creds);
    //Load all information (sheets, metadata) of the Google Sheets file
    await doc.loadInfo();

    //access Draft Sheet
    const draftSheet = doc.sheetsByIndex[1];
    const draft_rows = await draftSheet.getRows();

    //console.log(draft_rows);

    for(i=0; i<draft_rows.length; i++){

        if(draft_rows[i].contact === name){
            draft_rows[i].del();
        }

        else{
            continue;
        }

    };


}

//const name = 'whatsapp_dmdn8qa2hjvjlr1vusqktcif8zcgjghm';
//deleteDraftRows(name);

exports.handler = async function (context, event, callback) {

    const name = event.From;

    await deleteDraftRows(name);
    
    callback(null, deleteDraftRows);
  
  };