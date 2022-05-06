import * as express from 'express';
import * as cors from 'cors';
import * as passport from 'passport';
import * as cookieParser from 'cookie-parser';
import * as bcrypt from 'bcryptjs';
import * as session from 'express-session';
import * as bodyParser from 'body-parser';
import { prisma } from './connect';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

app.use(session({
    secret: "secretcode",
    resave: true,
    saveUninitialized: true
}));

app.use(cookieParser("secretcode"));

app.use(passport.initialize());
app.use(passport.session());
require("./passportConfig")(passport);

app.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if(err) return err;
        if(!user) res.send("No user exists");
        else{
            req.logIn(user, err => {
                if(err) return;
                res.send("Successfully authenticated");
                console.log(req.user);
            })
        }
    })(req, res, next);
});

app.post("/register", async (req, res) => {
    const user = await prisma.user.findFirst({
        where: { username: req.body.username }
    });
    if(user) res.send("Чел уже существует!");
    if(!user){
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        await prisma.user.create({
            data: {
                username: req.body.username,
                password: hashedPassword
            }
        });
        res.send("Created!");
    }
});

app.get("/user", (req, res) => {
    if (req.isAuthenticated()) {
        res.send(req.user);
    }else {
        res.send("not auth");
    }
});

app.post("/createFolder", async (req, res) => {
    if (req.isAuthenticated()){
        await prisma.user.update({
            where: {
                id: req.user["id"]
            },
            data: {
                folders: {
                    create: {
                        title: req.body.title
                    }
                }
            }
        });
        res.send("Greate");
    }else{
        res.send("Not auth");
    }
});

app.post("/deleteFolder", async (req, res) => {
    if (req.isAuthenticated()){
        await prisma.user.update({
            where: {
                id: req.user["id"]
            },
            data: {
                folders: {
                    delete: {
                        id: req.body.id
                    }
                }
            }
        });
        await prisma.task.deleteMany({
            where: {
                folderId: req.body.id,
                AND: {
                    authorId: req.user["id"]
                }
            }
        })
        res.send("Greate");
    }else{
        res.send("Not auth");
    }
});

app.get("/getUserFolder", async (req, res) => {
    if (req.isAuthenticated()){
        const folder = await prisma.folder.findMany({
            where: {
                authorId: req.user["id"]
            }
        });
        res.send(folder);
    }else{
        res.send("Not auth");
    }
});

app.post("/createTask", async (req, res) => {
    if (req.isAuthenticated()){
        await prisma.user.update({
            where: {
                id: req.user["id"]
            },
            data: {
                tasks: {
                    create: {
                        title: req.body.title,
                        isCompleted: false,
                        folderId: req.body.id
                    }
                }
            }
        });
        res.send("Greate");
    }else{
        res.send("Not auth");
    }
});

app.post("/deleteTask", async (req, res) => {
    if (req.isAuthenticated()){
        await prisma.user.update({
            where: {
                id: req.user["id"]
            },
            data: {
                tasks: {
                    delete: {
                        id: req.body.id
                    }
                }
            }
        });
        res.send("Greate");
    }else{
        res.send("Not auth");
    }
});

app.post("/updateTask", async (req, res) => {
    if (req.isAuthenticated()){
        let task = await prisma.task.findFirst({
            where: {
                id: req.body.id
            }
        });

        await prisma.user.update({
            where: {
                id: req.user["id"]
            },
            data: {
                tasks: {
                    update: {
                        where: {
                            id: req.body.id
                        },
                        data:{
                            isCompleted: !task.isCompleted
                        }
                    }
                }
            }
        });
        res.send("Greate");
    }else{
        res.send("Not auth");
    }
});

app.post("/changeTitleTask", async (req, res) => {
    if (req.isAuthenticated()){
        await prisma.user.update({
            where: {
                id: req.user["id"]
            },
            data: {
                tasks: {
                    update: {
                        where: {
                            id: req.body.id
                        },
                        data: {
                            title: req.body.title
                        }
                    }
                }
            }
        });
        res.send("Greate");
    }else{
        res.send("Not auth");
    }
});

app.post("/getUserTask", async (req, res) => {
    if (req.isAuthenticated()){
        if(!req.body.id) return res.send([]);
        const task = await prisma.task.findMany({
            where: {
                folderId: req.body.id,
                AND: {
                    authorId: req.user["id"]
                }
            }
        });
        res.send(task);
    }else{
        res.send("Not auth");
    }
});

app.get("/logout", (req, res) => {
    req.logout();
    res.send("success")
});

app.listen(4000, () => {
    console.log("Server has started");
});