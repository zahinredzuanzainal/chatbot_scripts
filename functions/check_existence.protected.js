const { GoogleSpreadsheet } = require('google-spreadsheet');
//const MessagingResponse = require('twilio').twiml.MessagingResponse;
let fs = require('fs');

let credsFile = Runtime.getAssets()['/creds.json'].path;
//let credsFile = "C:/Users/Lenovo/Desktop/chatbot_projects/dodobot_1/dodobot-1/assets/creds.private.json"
//let creds = JSON.parse(fs.readFileSync(credsFile, {encoding:'utf8', flag:'r'}));
let creds = JSON.parse(fs.readFileSync(credsFile, 'utf8'));


async function ensureNotExist(rows_array, name){


        let name_match_status = 'false'; //not found
        //console.log(name_match_status);

        const name_match = rows_array.filter(row => row.contact === name)[0];

        if(name_match){
            //console.log(name_match.contact);
            name_match_status = 'true';
            console.log(name_match_status);
        }   
        else{
            //console.log(`${name} does not exist!`);
            console.log(name_match_status);
        }

        return name_match_status;
}


async function mainFunction(name){

    const doc = new GoogleSpreadsheet('1SU9nJTwnIC-Hd0JTR8-A9D6LSjNRQUdvP5qU5qPZszM');
    //Obtain file access with provided credentials by service account
    await doc.useServiceAccountAuth(creds);
    //Load all information (sheets, metadata) of the Google Sheets file
    await doc.loadInfo();
    
    //get item_database sheet
    const draftSheet = doc.sheetsByIndex[1];

    //get rows from draftSheet
    const rows_array = await draftSheet.getRows();

    //check every name in name_array
    const name_match_status = await ensureNotExist(rows_array, name);

    return name_match_status;
        
}

//sample name

/*async function temp(){
const name = "Zahin";
const name_match_status = await mainFunction(name);
console.log(name_match_status);}

temp();*/

exports.handler = async function (context, event, callback) {
  
    const from = event.From;
  
    const name_match_status = await mainFunction(from);  

    const return_object = {name_match_bool: name_match_status};
  
    return callback(null, return_object);
  };

/*(async function tempFunc(name){

    const from = name;
  
    const name_match_status = await mainFunction(from);  

    const return_object = {name_match_bool: name_match_status};
  
    console.log(return_object);

}

const name = "Zahin";

tempFunc(name);*/

