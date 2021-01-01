const { LocalStorage } = require('node-localstorage');

const db = new LocalStorage('data');

const loadDogs = () => JSON.parse(db.getItem("dogs") || '[]');

function hasDog(name) {
        return loadDogs().map(dog => dog.name).includes(name);
}

module.exports = {
        addDog(newDog) {
                if (!hasDog(newDog.name)) {
                        let dogs = loadDogs();
                        dogs.push(newDog);
                        db.setItem("dogs", JSON.stringify(dogs, null, 2));
                }
        },

        findDogByName(name) {
                let dogs = loadDogs();
                return dogs.find(dog => dog.name === name);
        },

        findDogByColor(color) {
                let dogs = loadDogs();
                return dogs.filter(dog => dog.color === color);
        }
}