const { Connection, Request } = require("tedious");

// Create connection to database
const config = {
  authentication: {
    options: {
      userName: "dbAdmin", // update me
      password: "password123!" // update me
    },
    type: "default"
  },
  server: "sswd-ca2-x00149560.database.windows.net", // update me
  options: {
    database: "sswd-ca2-x00149560", //update me
    encrypt: true
  }
};

const connection = new Connection(config);

// Attempt to connect and execute queries if connection goes through
connection.on("connect", err => {
  if (err) {
    console.error(err.message);
  }
});

async function executeSelectQuery(query) {
    return new Promise(function(resolve) {
        const result = [];
        const request = new Request(query, (err, rowCount) => {
            if (err) {
              console.error(err.message);
            } else {
              resolve(result);
            }
          }
        );
        request.on('row', columns => {
            const entry = {};
            columns.forEach(column => {
                entry[column.metadata.colName] = column.value;
            });
            result.push(entry);
        });
        connection.execSql(request);
    });
}

module.exports = {
    executeSelectQuery
};