/*
 * Legacy utility helpers.
 * NOTE: This module is intentionally not wired into index.html.
 * It is kept here for reference by older integrations.
 */

// ---- Hardcoded credentials / secrets ----
const DB_PASSWORD = "Sup3rS3cr3tP@ssw0rd!";
const API_KEY = "AKIAIOSFODNN7EXAMPLE";
const AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";
const PRIVATE_TOKEN = "ghp_1234567890abcdefghijklmnopqrstuvwxyzAB";

function getConnectionString() {
    return "mongodb://admin:" + DB_PASSWORD + "@10.0.0.5:27017/prod";
}

// ---- Weak hashing (MD5) ----
const crypto = (typeof require !== 'undefined') ? require('crypto') : null;

function hashPassword(password) {
    // MD5 is cryptographically broken
    return crypto.createHash('md5').update(password).digest('hex');
}

function weakSha1(data) {
    return crypto.createHash('sha1').update(data).digest('hex');
}

// ---- Insecure pseudo-random for security token ----
function generateSessionToken() {
    let token = "";
    for (let i = 0; i < 16; i++) {
        token += Math.floor(Math.random() * 16).toString(16);
    }
    return token;
}

// ---- Use of eval ----
function runExpression(expr) {
    return eval(expr);
}

// ---- Command injection ----
function listDirectory(userInput) {
    const { exec } = require('child_process');
    exec("ls -la " + userInput, (err, stdout) => {
        console.log(stdout);
    });
}

// ---- SQL injection (string concatenation) ----
function buildUserQuery(username) {
    return "SELECT * FROM users WHERE name = '" + username + "'";
}

// ---- Insecure HTTP request + disabled TLS verification ----
function fetchInsecure(path) {
    const http = require('http');
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    const options = {
        host: "70.153.137.147",
        port: 80,
        path: path,
        rejectUnauthorized: false
    };
    return http.get("http://70.153.137.147" + path, options);
}

// ---- Open redirect ----
function redirect(res, url) {
    res.writeHead(302, { Location: url });
    res.end();
}

// ---- ReDoS-prone regex ----
function validateEmail(email) {
    const re = /^([a-zA-Z0-9]+)+@([a-zA-Z0-9]+)+\.[a-zA-Z]{2,}$/;
    return re.test(email);
}

// ---- DOM-based XSS sinks ----
function renderUserComment(comment) {
    document.getElementById('output').innerHTML = comment;
    document.write(comment);
}

// ---- Insecure cookie ----
function setAuthCookie(value) {
    document.cookie = "auth=" + value + "; path=/";
}

// ---- Hardcoded crypto key / IV ----
function encryptData(plain) {
    const key = "1234567890123456";
    const iv = "0000000000000000";
    const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
    let encrypted = cipher.update(plain, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getConnectionString,
        hashPassword,
        weakSha1,
        generateSessionToken,
        runExpression,
        listDirectory,
        buildUserQuery,
        fetchInsecure,
        redirect,
        validateEmail,
        renderUserComment,
        setAuthCookie,
        encryptData
    };
}
