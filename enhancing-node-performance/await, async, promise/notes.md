# Async, Await and Promises

Let's first create a sample project to work with.

We will be creating following the file structure:

```
├───index.html
├───callbacks.js
└───promises.js
```

 Let's write bare-minimum `html` in `index.html`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Async JS</title>
</head>
<body>
        <script src="callbacks.js"></script>
        <!-- <script src="promises.js"></script> -->
</body>
</html>
```

We will try to simulate a blog-post server through `callbacks.js` and demonstrate the usage of `callbacks`.

```js
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
        setTimeout(() => {
                posts.push(post);
        }, 2000);
}
getPost();
createPost({title: 'Post Four', body: 'This is post four'}); 
```

On launching with Live Server, the following is rendered on to screen.

```
- Post One
- Post Two
- Post Three
```

But after one second.

If you are wondering, why did it not display all 4 posts, the reason is pretty straight-forward.

The `getPost` takes 1 sec to get all posts, `createPost` takes 2 sec to create and update `posts`. By the time `posts` was updated, the DOM was already painted.
So even `createPost` updated `posts`, nothing could be done.

This is where asynchronous programming and `callbacks` comes in.

So we need to call the `getPost` function as a `callback` function in `createPost`. In order to do that, we pass `getPost` as a formal parameter in `createPost`.

The `callbacks.js` looks something like this now.

```js
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

createPost = (post, callback) => {
        setTimeout(() => {
                posts.push(post);
                callback();
        }, 2000);

}
createPost({title: 'Post Four', body: 'This is post four'}, getPost); 
```

The output thus obtained:

```
- Post One
- Post Two
- Post Three
- Post Four
```

Now let's try to demonstrate the usage of `promises` through `promises.js`.

Uncomment the `promises.js` and comment `callbacks.js` in `index.html` making it look something like this.

```html
<!DOCTYPE html>
<html lang="en">
<head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Async JS</title>
</head>
<body>
        <!-- <script src="callbacks.js"></script> -->
        <script src="promises.js"></script>
</body>
</html>
```

Now let's see `promises.js`. We will copy everything from `callbacks.js` into `promises.js` and make use of `Promises`.

Just before that a `Promise` takes in an `executor` function (which takes in two parameters `resolve` function and `reject` function and a `function-body`.

When we want to resolve a promise successfully, we call `resolve` function and when something errors out, we call `reject` function.

```js
let myFirstPromise = new Promise((resolve, reject) => {
  // We call resolve(...) when what we were doing asynchronously was successful, and reject(...) when it failed.
  // In this example, we use setTimeout(...) to simulate async code.
  // In reality, you will probably be using something like XHR or an HTML5 API.
  setTimeout( function() {
    resolve("Success!")  // Yay! Everything went well!
  }, 250)
})

myFirstPromise.then((successMessage) => {
  // successMessage is whatever we passed in the resolve(...) function above.
  // It doesn't have to be a string, but if it is only a succeed message, it probably will be.
  console.log("Yay! " + successMessage)
});

```

Let's use it in `createPost` within `promises.js`.

```js
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
                        const error = false;
                        if (!error) {
                                resolve();
                        } else {
                                reject('Error: Something went wrong');
                        }
                }, 2000);

        })
}
createPost({ title: 'Post Four', body: 'This is post four' }).then(getPost);
```

Here we obtain the same output as before:

```
- Post One
- Post Two
- Post Three
- Post Four
```

If for some reason 4, `const error = true` within `createPost`, it gives a console error something like this:

```
index.html:1 Uncaught (in promise) Error: Something went wrong
```

But let's fix that as well, by adding `.catch()`. The fixed `createPost` call looks something like this.

```js
createPost({ title: 'Post Four', body: 'This is post four' })
        .then(getPost)
        .catch(err => console.log(err));
```

The console output would now be:

```
promises.js:42 Error: Something went wrong
```

## Using `Promises.all`

Let's demonstrate some types of `Promise`s.

```js
// Promises.all
const promise1 = Promise.resolve('Hello World !');
const promise2 = 10;
const promise3 = new Promise((resolve, reject) => {
        setTimeout(resolve, 2000,'GoodBye' );
})
```

Let's call them all together using `Promise.all`.

```js
Promise.all([promise1, promise2, promise3])
        .then(values => console.log(values));
```

The output would be:

```js
(3) ["Hello World !", 10, "GoodBye"]
0: "Hello World !"
1: 10
2: "GoodBye"
length: 3
__proto__: Array(0)
```

Let's try adding a `fetch` call as a `Promise` as well.

The code should look something like this.

````js
const promise1 = Promise.resolve('Hello World !');
const promise2 = 10;
const promise3 = new Promise((resolve, reject) => {
        setTimeout(resolve, 2000, 'GoodBye');
});
const promise4 = fetch('https://jsonplaceholder.typicode.com/todos/1')
					.then(res => res.json())
Promise.all([promise1, promise2, promise3, promise4])
        .then(values => console.log(values));
````

The output looks something like this:

```js
0: "Hello World !"
1: 10
2: "GoodBye"
3: {userId: 1, id: 1, title: "delectus aut autem", completed: false}
length: 4
__proto__: Array(0)
```

## `async` and `await`

To use `await` within a function, it needs to be `async`.

It is a more elegant way to handle `Promise`s. Implementing it within `promises.js` makes it look like this:

```js
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
// Async / Await
async function init() {
        await createPost({
                title : 'Post Three', body: 'This is post three' 
        });
        getPost();
}
init();
```

Also we could add in `fetch()` as well.

```js
async function fetchUsers() {
        const res = await fetch('https://jsonplaceholder.typicode.com/todos/1');
        const data = await res.json();
        console.log(data);
}
fetchUsers();
```

The output is:

```js
(10) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
0: {id: 1, name: "Leanne Graham", username: "Bret", email: "Sincere@april.biz", address: {…}, …}
1: {id: 2, name: "Ervin Howell", username: "Antonette", email: "Shanna@melissa.tv", address: {…}, …}
2: {id: 3, name: "Clementine Bauch", username: "Samantha", email: "Nathan@yesenia.net", address: {…}, …}
3: {id: 4, name: "Patricia Lebsack", username: "Karianne", email: "Julianne.OConner@kory.org", address: {…}, …}
4: {id: 5, name: "Chelsey Dietrich", username: "Kamren", email: "Lucio_Hettinger@annie.ca", address: {…}, …}
5: {id: 6, name: "Mrs. Dennis Schulist", username: "Leopoldo_Corkery", email: "Karley_Dach@jasper.info", address: {…}, …}
6: {id: 7, name: "Kurtis Weissnat", username: "Elwyn.Skiles", email: "Telly.Hoeger@billy.biz", address: {…}, …}
7: {id: 8, name: "Nicholas Runolfsdottir V", username: "Maxime_Nienow", email: "Sherwood@rosamond.me", address: {…}, …}
8: {id: 9, name: "Glenna Reichert", username: "Delphine", email: "Chaim_McDermott@dana.io", address: {…}, …}
9: {id: 10, name: "Clementina DuBuque", username: "Moriah.Stanton", email: "Rey.Padberg@karina.biz", address: {…}, …}
length: 10
__proto__: Array(0)
```

