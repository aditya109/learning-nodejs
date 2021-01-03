const posts = [
        {
                title: 'Post One',
                body: 'This is post one'
        },
        {
                title: 'Post Two',
                body: 'This is post two'
        },
        {
                title: 'Post Three',
                body: 'This is post three'
        },
];

function getPost() {
        setTimeout(() => {
                let output = '';
                posts.forEach((post, index) => {
                        output += `<li>${post.title}</li>`
                });
                document.body.innerHTML = output;
        }, 1000);
}

createPost = (post) => {
        return new Promise((resolve, reject) => {
                setTimeout(() => {
                        posts.push(post);
                        const error = true;
                        if (!error) {
                                resolve();
                        } else {
                                reject('Error: Something went wrong');
                        }
                }, 2000);

        })
}
// createPost({ title: 'Post Four', body: 'This is post four' })
//         .then(getPost)
//         .catch(err => console.log(err));

// Async / Await
// async function init() {
//         await createPost({
//                 title : 'Post Three', body: 'This is post three' 
//         });
//         getPost();
// }
// init();
async function fetchUsers() {
        const res = await fetch('https://jsonplaceholder.typicode.com/users');
        const data = await res.json();
        console.log(data);
}
fetchUsers();








// Promises.all
// const promise1 = Promise.resolve('Hello World !');
// const promise2 = 10;
// const promise3 = new Promise((resolve, reject) => {
//         setTimeout(resolve, 2000, 'GoodBye');
// });
// const promise4 = fetch('https://jsonplaceholder.typicode.com/todos/1').then(res => res.json())
// Promise.all([promise1, promise2, promise3])
//         .then(values => console.log(values));