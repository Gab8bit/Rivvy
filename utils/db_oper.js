import pool from '../db.js';
import { now } from './time.js';

//Controlla se l'utente esiste. 0 = non esiste, 1 = esiste
async function checkUser(userID){
    const [rows] = await pool.query(
        'SELECT userID from users WHERE userID = ?',
        [userID]
    );

    if(rows.length === 0){
        return 0;
    }else return 1;
}

//Crea l'utente se non esiste nel DB. Questa è la funzione che va invocata nel progetto.
export async function createUserIfNotExist(userID){
    if(!(await checkUser(userID))){
        await pool.query(
            'INSERT IGNORE INTO users (userID, messages, vctime, money) VALUES (?, 0, 0, 0)',
            [userID]
        );
        console.log(`[${now()} INFO] db_oper: Created new record for ${userID}`);
    }
}

//Restituisce una colonna specifica dal DB degli utenti. Non raccomandata da invocare direttamente nel progetto.
export async function getFromUser(userID, column){
    if(await checkUser(userID)){
        const [rows] = await pool.query(
            `SELECT ${column} AS result FROM users WHERE userID = ?`,
            [userID]
        );
        return rows[0].result;
    }else{
        console.error(`[${now()} ERROR] db_oper: No record for ${userID}. You should first create a record before invoke getFromUser()!`);
        return -1;
    }
}

//Restituisce i soldi di un utente. -1 se l'utente non esiste.
export async function getMoney(userID){
    return getFromUser(userID,"money");
}

//Restituisce i messaggi totali di un utente. -1 se l'utente non esiste.
export async function getMessageSum(userID){
    return getFromUser(userID,"messages");
}

//Restituisce il tempo in VC di un utente. -1 se l'utente non esiste.
export async function getVCtime(userID){
    return getFromUser(userID,"vctime");
}

//Aggiorna i soldi di un utente. Passa un valore negativo per sottrarre.
export async function updateMoney(userID, amount){
    if(!(await checkUser(userID))){
        console.error(`[${now()} ERROR] db_oper: No record for ${userID}. You should first create a record before invoke updateMoney()!`);
        return -1;
    }
    await pool.query(
        'UPDATE users SET money = money + ? WHERE userID = ?',
        [amount, userID]
    );
}

//Incrementa il contatore messaggi di un utente.
export async function incrementMessages(userID){
    if(!(await checkUser(userID))){
        console.error(`[${now()} ERROR] db_oper: No record for ${userID}. You should first create a record before invoke incrementMessages()!`);
        return -1;
    }
    await pool.query(
        'UPDATE users SET messages = messages + 1 WHERE userID = ?',
        [userID]
    );
}

//Aggiunge secondi al tempo in VC di un utente.
export async function addVCtime(userID, seconds){
    if(!(await checkUser(userID))){
        console.error(`[${now()} ERROR] db_oper: No record for ${userID}. You should first create a record before invoke addVCtime()!`);
        return -1;
    }
    await pool.query(
        'UPDATE users SET vctime = vctime + ? WHERE userID = ?',
        [seconds, userID]
    );
}

export async function addTransaction(userID, newMoney){
    var oldMoney;
    if(!(await checkUser(userID))){
        console.error(`[${now()} WARN] db_oper: No record for ${userID}. Creating transaction starting from 0...`);
        oldMoney = 0;
    }else oldMoney = await getMoney(userID);
    await pool.query(
        'INSERT INTO operations (userID, startMoney, endMoney) VALUES (?, ?, ?)',
        [userID, oldMoney, oldMoney+newMoney]
    );
}

export async function updateUsername(userID, username){
    if(!(await checkUser(userID))){
        console.error(`[${now()} ERROR] db_oper: No record for ${userID}. You should first create a record before invoke updateUsername()!`);
        return -1;
    }
    await pool.query(
        'UPDATE users SET username = ? WHERE userID = ? AND (username != ? OR username IS NULL)',
        [username, userID, username]
    );
}

export async function getLeaderboard(maxresults, orderby){
    const ALLOWED_COLUMNS = ['messages', 'vctime', 'money'];
    if (!ALLOWED_COLUMNS.includes(orderby)) throw new Error('Colonna non valida');
    const [rows] = await pool.query(`SELECT username, ${orderby} AS result FROM users ORDER BY ${orderby} DESC LIMIT ${maxresults}`);
    return rows;
}

export async function getUserRank(userid, orderby){
    const ALLOWED_COLUMNS = ['messages', 'vctime', 'money'];
    if (!ALLOWED_COLUMNS.includes(orderby)) throw new Error('Colonna non valida');
    const [rows] = await pool.query(
        `SELECT COUNT(*) + 1 AS user_rank FROM users WHERE ${orderby} > (SELECT ${orderby} FROM users WHERE userID = ?)`,
        [userid]
    );
    return rows[0].user_rank;
}