import React, { useEffect, useState } from "react";
import axios from 'axios';
import { TodoItem } from "./components/todoItem";
import { CreateTodoField } from "./components/createTodoField";
import { CreateFolderField } from "./components/createFolderField";

export default function Main(){
    const [todos, setTodos] = useState([]);
    const [folders, setFolders] = useState([]);
    const [folder, setFolder] = useState("");
    const [folderName, setFolderName] = useState("");
    const [username, setUsername] = useState(null);

    // const changeTodo = (id: string) => {
	// 	const copy = [...todos]
	// 	const current = copy.find(t => t.id === id)!
	// 	current.isCompleted = !current.isCompleted
	// 	setTodos(copy)
	// }

    // const removeTodo = (id: string) => setTodos([...todos].filter(t => t.id !== id))

    useEffect(() => {
        axios({
            method: "GET",
            withCredentials: true,
            url: "http://localhost:4000/user"
        }).then(res => {
            if(res.data === "not auth"){
                window.location.href = "/auth";
            }else{
                setUsername(res.data.username);
            }
        });
        getFolder();
    }, [])

    const getTask = (id:string) => {
        axios({
            method: "POST",
            data: {
                id
            },
            withCredentials: true,
            url: "http://localhost:4000/getUserTask"
        }).then(res => {
            let sortedDescending = res.data.sort((a:any, b:any) => {
                return b.id - a.id;
            });

            sortedDescending.sort((a:any, b:any) => {
                return Number(a.isCompleted) - Number(b.isCompleted);
            });
            setTodos(sortedDescending);
        });
    }

    const getFolder = async () => {
        await axios({
            method: "GET",
            withCredentials: true,
            url: "http://localhost:4000/getUserFolder"
        }).then(res => {
            setFolders(res.data);
            if(res.data.length){
                getTask(res.data[0].id);
                setFolder(res.data[0].id);
                setFolderName(res.data[0].title);
            }else{
                getTask("");
                setFolder("");
                setFolderName("");
            }
        });
    }

    const deleteFolder = async (id:string) => {
        await axios({
            method: "POST",
            data: {
                id
            },
            withCredentials: true,
            url: "http://localhost:4000/deleteFolder"
        })
        getFolder();
    }

    const logout = () => {
        axios({
            method: "GET",
            withCredentials: true,
            url: "http://localhost:4000/logout"
        }).then(res => window.location.href = "/auth");
    };

    return(
        <>
            <header>
                <div className="container header-container">
                    <div className="header-block">
                        <h1>Welcome back, {username}!</h1>
                        <button onClick={logout} className="btn-reset">Logout</button>
                    </div>
                </div>
            </header>
            <main>
                <div className="container">
                    <div className="block">
                        <div className="block-content">
                            <div className="folders">
                                <CreateFolderField getFolder={getFolder}/>
                                <div className="folders-list">
                                    {folders.map(folder => (
                                        <div className="folder">
                                            <button className="btn-reset" key={folder["id"]} onClick={() => {getTask(folder["id"]); setFolder(folder["id"]); setFolderName(folder["title"])}}>{folder["title"]}</button>
                                            <div className="folder-buttons">
                                                <button className="btn-reset share-btn"><svg width="12" viewBox="0 0 237 311" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M126.351 3.24842C124.268 1.16835 121.444 0 118.5 0C115.556 0 112.732 1.16835 110.649 3.24842L62.5088 51.3809C60.5464 53.4865 59.4781 56.2715 59.5288 59.1491C59.5796 62.0267 60.7456 64.7722 62.781 66.8073C64.8164 68.8424 67.5624 70.0081 70.4405 70.0589C73.3186 70.1096 76.104 69.0415 78.21 67.0795L107.391 37.9038V196.223C107.391 199.168 108.561 201.994 110.644 204.077C112.728 206.16 115.554 207.33 118.5 207.33C121.446 207.33 124.272 206.16 126.356 204.077C128.439 201.994 129.609 199.168 129.609 196.223V37.9038L158.79 67.0795C159.807 68.1708 161.034 69.0461 162.396 69.6532C163.759 70.2603 165.23 70.5867 166.722 70.613C168.213 70.6393 169.695 70.365 171.078 69.8063C172.462 69.2477 173.718 68.4162 174.773 67.3614C175.828 66.3067 176.66 65.0503 177.219 63.6672C177.777 62.2841 178.052 60.8027 178.025 59.3113C177.999 57.8199 177.673 56.3491 177.065 54.9866C176.458 53.624 175.583 52.3978 174.491 51.3809L126.351 3.24842V3.24842ZM22.2188 129.578C22.2188 128.596 22.6089 127.654 23.3034 126.96C23.9978 126.265 24.9397 125.875 25.9219 125.875H62.9531C65.8995 125.875 68.7252 124.705 70.8086 122.622C72.892 120.539 74.0625 117.714 74.0625 114.768C74.0625 111.822 72.892 108.997 70.8086 106.913C68.7252 104.83 65.8995 103.66 62.9531 103.66H25.9219C19.047 103.66 12.4536 106.391 7.59234 111.251C2.73105 116.112 0 122.704 0 129.578V285.083C0 299.389 11.613 311 25.9219 311H211.078C217.953 311 224.546 308.269 229.408 303.409C234.269 298.548 237 291.956 237 285.083V129.578C237 122.704 234.269 116.112 229.408 111.251C224.546 106.391 217.953 103.66 211.078 103.66H174.047C171.1 103.66 168.275 104.83 166.191 106.913C164.108 108.997 162.938 111.822 162.938 114.768C162.938 117.714 164.108 120.539 166.191 122.622C168.275 124.705 171.1 125.875 174.047 125.875H211.078C212.06 125.875 213.002 126.265 213.697 126.96C214.391 127.654 214.781 128.596 214.781 129.578V285.083C214.781 286.064 214.391 287.006 213.697 287.701C213.002 288.395 212.06 288.785 211.078 288.785H25.9219C24.9397 288.785 23.9978 288.395 23.3034 287.701C22.6089 287.006 22.2188 286.064 22.2188 285.083V129.578Z" fill="#525252"/></svg></button>
                                                <button className="btn-reset trash-btn" onClick={() => {deleteFolder(folder["id"])}}><svg width="12" viewBox="0 0 234 315" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M215.993 23.942H151.157V17.477C151.157 7.841 143.413 0 133.894 0H99.546C90.025 0 82.28 7.841 82.28 17.478V23.943H17.445C7.826 23.943 0 31.703 0 41.24V52.669C0 59.837 4.42 65.999 10.698 68.62C12.687 108.243 24.198 299.813 24.716 308.421C24.938 312.117 28 315.001 31.703 315.001H201.736C205.439 315.001 208.502 312.117 208.723 308.421C209.241 299.814 220.751 108.243 222.741 68.62C229.019 65.999 233.439 59.837 233.439 52.669V41.239C233.439 31.702 225.613 23.942 215.993 23.942V23.942ZM96.28 17.478C96.28 15.56 97.745 14 99.546 14H133.894C135.694 14 137.158 15.56 137.158 17.478V23.943H96.281V17.478H96.28ZM13.998 41.239C13.998 39.421 15.544 37.942 17.443 37.942H215.992C217.891 37.942 219.437 39.42 219.437 41.239V52.668C219.437 54.487 217.891 55.967 215.992 55.967H17.444C15.545 55.967 13.999 54.488 13.999 52.668V41.239H13.998ZM195.141 301H38.293C36.238 266.753 26.814 109.326 24.783 69.967H208.65C206.619 109.326 197.196 266.753 195.141 301V301Z" fill="#525252"/><path d="M116.719 95.125C112.853 95.125 109.719 98.259 109.719 102.125V278.234C109.719 282.1 112.853 285.234 116.719 285.234C120.585 285.234 123.719 282.1 123.719 278.234V102.125C123.719 98.259 120.585 95.125 116.719 95.125V95.125Z" fill="#525252"/><path d="M69.419 102.04C69.217 98.18 65.912 95.203 62.064 95.415C58.204 95.616 55.237 98.909 55.439 102.77L64.621 278.599C64.816 282.335 67.906 285.234 71.605 285.234C71.728 285.234 71.852 285.231 71.976 285.224C75.836 285.023 78.803 281.73 78.601 277.869L69.419 102.04V102.04Z" fill="#525252"/><path d="M171.374 95.415C167.475 95.192 164.221 98.179 164.019 102.04L154.835 277.869C154.633 281.73 157.6 285.023 161.46 285.224C161.585 285.231 161.708 285.234 161.831 285.234C165.529 285.234 168.62 282.336 168.815 278.599L177.999 102.77C178.201 98.909 175.235 95.616 171.374 95.415V95.415Z" fill="#525252"/></svg></button>
                                            </div>
                                        </div>
                                    ))}
                                    <h3>Shared</h3>
                                    <div className="folder">
                                        <button className="btn-reset">School</button>
                                    </div>
                                    <div className="folder">
                                        <button className="btn-reset">Work</button>
                                    </div>
                                    <div className="folder">
                                        <button className="btn-reset">Zabor</button>
                                    </div>
                                </div>
                            </div>
                            <div className="todo-app">
                                <div className="todo-content">
                                    <h2>{folderName}</h2>
                                    {
                                        folders.length ? <CreateTodoField getTask={getTask} folder={folder}/> : <p className="no-folders">You don't have folders...</p>
                                    }
                                    <div className="tasks">
                                        {todos.map(todo => (
                                            <TodoItem key={todo["id"]} todo={todo} getTask={getTask} folder={folder} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}