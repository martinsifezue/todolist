const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");
const { application } = require("express");
const srvr = process.env.N1_KEY; 
const srvrCred = process.env.N1_SECRET;
const PORT = process.env.PORT || 3000;

const today = require(__dirname + "/date.js");


const app = express();

app.use(express.urlencoded({extended: true}));
app.set("view engine", "ejs")
app.use(express.static("public"));

main().catch(err => console.log(err))

async function main(){
 await mongoose.connect("mongodb+srv://"+ srvr + ":" + srvrCred + "@cluster0.xrqe7.mongodb.net/TDlist", {useNewUrlParser: true});

}

const mylist = [];

const ListSchema = new mongoose.Schema({
  name: String
});

const List = new mongoose.model("list", ListSchema);
 
const list = new List({
  name: String
})

const itemSchema = new mongoose.Schema({
  name: String,
  items: [ ListSchema ]
});

const Customitem = new mongoose.model("newitem", itemSchema);

app.get("/", (req, res) => {


  List.find({}, function(err, foundcontents){
    if(!err){
      Customitem.find({}, function(err, foundlists){
        if(!err){


           let day = today.getDate(); 
            res.render("home", {List:foundlists, Today: day})
            
        }
      });
    }
    
  });

});



app.get("/:customTdList", function(req, res){
  const customTdList = _.capitalize(req.params.customTdList);


  
  Customitem.findOne({name: customTdList}, function(err, foundlist){
    if(!err){
      if(!foundlist){
        const newlist = new Customitem ({
          name: customTdList,
          items: []
          
        });
        newlist.save(function(err, result){
          res.redirect("/" + customTdList);
        });
       
      }else{
        res.render("list", {ListTitle: foundlist.name, listcontent: foundlist.items});
      } 
    }
  });

});
app.post("/create", function(req, res){

const createlist = req.body.createlist;

res.redirect("/" + createlist)

});

app.post("/", function(req, res){

  const newitem = req.body.newitem;
  const customlist = req.body.lists;
  
  const additem = new List({
    name: newitem
   
   });
  
  if(customlist === "Today"){
    additem.save(function(err, result){
      res.redirect("/");
    });
   
  
  }else{
    Customitem.findOne({name: customlist}, function(err, foundlist){
      
        foundlist.items.push(additem);
        foundlist.save(function(err, result){
          res.redirect("/" + customlist);
        });
        
      
     
    });
  }
  
  
  });


app.post("/delete", function(req, res){
 const checkedboxid = req.body.checkedboxid;
const deletecustomitem = req.body.deletecustomitem;


if(deletecustomitem === "Today" ){

  List.findByIdAndRemove(checkedboxid, function(err){
    if(err){
      console.log(err);
    }else{
      console.log("Deleted the item")
      
    res.redirect("/");
    }
    
   });

}else{

Customitem.findOne({name: deletecustomitem}, function(err, foundlist){
  if(!err){
    foundlist.items.pull({_id: checkedboxid});
    foundlist.save(function(){
      res.redirect("/" + deletecustomitem);
    });
  }
});



}

 
});




app.listen(PORT, () => console.log(`Port is up and running on ${ PORT }`)
);