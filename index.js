require("dotenv").config({ path: __dirname + "/.env" });
const { twitterClient,twitterBearer } = require("./twitterClient.js")
const sqlite3 = require('sqlite3').verbose();
let sql;

//connect to database
const db = new sqlite3.Database("./twitterDb.db",sqlite3.OPEN_READWRITE,(err)=>{
  if(err) return console.error(err.message);
})

//create table
function createTable(){
  sql = `CREATE TABLE users(id INTEGER PRIMARY KEY,twitterName,twitterUserName,userTwitterId)`;
  db.run(sql);
  console.log("Created");
}


//drop table
function dropTable(){
  db.run("DROP TABLE users");
  console.log("Deleted");
}

//Insert data into table
 function insertTweetUser(name,username,id){
  sql = `INSERT INTO users(twitterName,twitterUserName,userTwitterId) VALUES (?,?,?)`;
db.run(sql,[name,username,id],(err)=>{
  if(err) return console.error(err.message);
})
}


 //------------------------------------------1--------------------------------------------------

//Track “ESTIAM” hashtag
const searchTweet = async () => {
   
const findTweets = await twitterBearer.v2.search('#ESTIAM',{
  "query": "from:username",
  "expansions": ["author_id"]});
  let lisOfId=[];

for await (const tweet of findTweets) {
  
  //add data of author in table
    if( lisOfId.includes(tweet.author_id)){
      console.log("Already exist");
    }
    else{
      lisOfId.push(tweet.author_id);
      const userInfo = await twitterBearer.v2.user(tweet.author_id);
      insertTweetUser(userInfo.data.name,userInfo.data.username,tweet.author_id);
      console.log("Data insert");
    }
  
  console.log(tweet);
}
  }


   //------------------------------------------2--------------------------------------------------

  //Like every tweet with the hashtag
  const like = async () => {
    const findTweets = await twitterBearer.v2.search('#ESTIAM');

    for await (const tweet of findTweets) {
        await twitterClient.v2.like(process.env.APP_ID, tweet.id);
    }
}


 //------------------------------------------3--------------------------------------------------

//Retweet every post containing the hashtag
const retweet = async () => {
  const findTweets = await twitterBearer.v2.search('#ESTIAM');

  for await (const tweet of findTweets) {
    await twitterClient.v2.retweet(process.env.APP_ID, tweet.id);
}
}

 //------------------------------------------4--------------------------------------------------

// test if the twitter account has 100 or more followers to follow it
const testToFollow = async (id) => {

  //id of my twitter account 
  myAccountId='1608141440999202816'

//get number of followers
 const follower = await twitterBearer.v2.followers(id) ;

//test
 if(follower.meta.result_count>=100){
   //await twitterClient.v2.follow(myAccountId,id);
   console.log("follow");
 }
 else{
   console.log("not follow, under 100 followers");
 }
 
   }

//Following users mentioning the hashtag with more than 100 followers 
function follow(){
  sql = `SELECT userTwitterId FROM users`;
db.all(sql,[],(err,rows)=>{
  if(err) return console.error(err.message);
    rows.forEach((row)=>{
      let id=row.userTwitterId;
      testToFollow(id)
    });
})
}


  //createTable();
  //dropTable();

  //searchTweet();
  //like();
  //retweet();
  //follow();

 
  
