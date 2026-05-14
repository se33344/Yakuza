require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { createClient } =
require("@supabase/supabase-js");

const {
    Client,
    GatewayIntentBits
} = require("discord.js");

const app = express();

app.use(cors());
app.use(express.json());

/* ===================================================
SUPABASE
=================================================== */

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

/* ===================================================
DISCORD
=================================================== */

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;

client.login(TOKEN);

/* ===================================================
ROLES
=================================================== */

const roles = {

    "Presedintia yakuza":"1477013361974575256",
    "Vice presedinte":"1489885439149084722",
    "Director general":"1477044895775723520",
    "Consilier juridic":"1489596021704228864",
    "Senior":"1479790433545490463",
    "Asociat":"1477044190503502011",
    "Membru":"1496419125126238258",
    "Membru in teste":"1496455853459378297"
};

const warnRoles = {

    1:"1494682131866325164",
    2:"1494682177932103770",
    3:"1494682212770123886"
};

/* ===================================================
GET MEMBERS
=================================================== */

app.get("/members", async (req,res)=>{

    const { data, error } =
    await supabase
    .from("members")
    .select("*")
    .order("id",{ ascending:true });

    if(error){

        return res
        .status(500)
        .json(error);
    }

    res.json(data);
});

/* ===================================================
SET RANK
=================================================== */

app.post("/set-rank", async (req,res)=>{

    try{

        const {
            discordId,
            rank
        } = req.body;

        const guild =
        await client.guilds.fetch(GUILD_ID);

        const member =
        await guild.members.fetch(discordId);

        for(const roleId of Object.values(roles)){

            if(member.roles.cache.has(roleId)){

                await member.roles.remove(roleId);
            }
        }

        await member.roles.add(
        roles[rank]
        );

        res.json({
            success:true
        });

    }catch(err){

        console.log(err);

        res.status(500).json({
            error:err.message
        });
    }
});

/* ===================================================
SET WARN
=================================================== */

app.post("/set-warn", async (req,res)=>{

    try{

        const {
            discordId,
            warns
        } = req.body;

        const guild =
        await client.guilds.fetch(GUILD_ID);

        const member =
        await guild.members.fetch(discordId);

        for(const roleId of Object.values(warnRoles)){

            if(member.roles.cache.has(roleId)){

                await member.roles.remove(roleId);
            }
        }

        if(warns > 0){

            await member.roles.add(
            warnRoles[warns]
            );
        }

        res.json({
            success:true
        });

    }catch(err){

        console.log(err);

        res.status(500).json({
            error:err.message
        });
    }
});

/* ===================================================
ADD MEMBER
=================================================== */

app.post("/members", async (req,res)=>{

    try{

        const {
            name,
            rank,
            discordId,
            date,
            warns
        } = req.body;

        const { data, error } =
        await supabase
        .from("members")
        .insert([
            {
                name,
                rank,
                discordId,
                date,
                warns
            }
        ])
        .select();

        if(error){

            return res
            .status(500)
            .json(error);
        }

        const guild =
        await client.guilds.fetch(GUILD_ID);

        const member =
        await guild.members.fetch(discordId);

        for(const roleId of Object.values(roles)){

            if(member.roles.cache.has(roleId)){

                await member.roles.remove(roleId);
            }
        }

        await member.roles.add(
        roles[rank]
        );

        res.json({
            success:true,
            member:data[0]
        });

    }catch(err){

        console.log(err);

        res.status(500).json({
            error:err.message
        });
    }
});

/* ===================================================
UPDATE MEMBER
=================================================== */

app.put("/members/:id", async (req,res)=>{

    try{

        const id = req.params.id;

        const {
            rank,
            warns
        } = req.body;

        const { error } =
        await supabase
        .from("members")
        .update({
            rank,
            warns
        })
        .eq("id",id);

        if(error){

            return res
            .status(500)
            .json(error);
        }

        res.json({
            success:true
        });

    }catch(err){

        console.log(err);

        res.status(500).json({
            error:err.message
        });
    }
});

/* ===================================================
DELETE MEMBER
=================================================== */

app.delete("/members/:id", async (req,res)=>{

    try{

        const id = req.params.id;

        const { error } =
        await supabase
        .from("members")
        .delete()
        .eq("id",id);

        if(error){

            return res
            .status(500)
            .json(error);
        }

        res.json({
            success:true
        });

    }catch(err){

        console.log(err);

        res.status(500).json({
            error:err.message
        });
    }
});

/* ===================================================
START
=================================================== */

app.listen(3000, ()=>{

    console.log("Server running on port 3000");
});