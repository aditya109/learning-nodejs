const uno = () => {
        return ("I am one !");
}

const dos = async () => {
        setTimeout(() => {
                return "I am two";
        }, 3000);
}
const tres = () => {
        return ("I am three !");
}

const callMe = () => {
        let valOne = uno();
        console.log(valOne);
        let valTwo = dos();
        console.log(valTwo);
        let valThree = tres();
        console.log(valThree);
}

var start = new Date().getTime();
callMe();
var end = new Date().getTime();
var time = end - start;
console.log('Execution time: ' + time);