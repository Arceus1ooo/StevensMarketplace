const invalidUsernameCharacters = '@() <>,'; //space is intentional
const categories = ['Furniture', 'Textbook', 'Technology', 'Sports Gear'];
const conditions = ['New', 'Good', 'Fair', 'Poor'];

//https://neverbounce.com/blog/format-email-address
//https://www.mybluelinux.com/7-bit-ascii-character-codes/


module.exports = {
    VerifyBool(bool) {
        if (!bool) throw 'a value must be supplied';
        if (typeof bool !== 'boolean') throw 'value must be true or false';
    },

    VerifyString(str, varName = 'input') {
        if (!str) throw 'a value must be supplied';
        if (typeof str !== 'string') throw `${varName} must be a string`;
        if (str.length === 0) throw `${varName} cannot be empty`;
        str = str.trim();
        if (str.length === 0) throw `${varName} cannot only contain spaces`;

        return str;
    },

    VerifyInt(input) {
        if (arguments.length !== 1) throw 'only one value must be supplied';
        input = String(input);
        for (let char of input) {
            if (char < '0' || char > '9') throw 'this number can only contain digits';
        }
        let num = Number(input);
        if (Number.isNaN(num)) throw 'value must be a number';
        if (input.includes('.')) throw 'value must be a whole number';
        if (num < 0) throw 'number must be a positive integer';
        return num;
    },

    VerifyArray(arr) {
        if (!arr) throw 'a value must be supplied';
        if (typeof arr !== 'object' || !Array.isArray(arr)) throw 'input must be an array';
    },

    VerifyFloat(float) { //verifies float up to two decimals
        if (!float) throw 'a number in string format must be supplied';
        float = this.VerifyString(float, 'price');
        let num = parseFloat(float);
        if (Number.isNaN(num)) throw 'value must be a number';
        if (num < 0) throw 'number cannot be negative';
        return Number(num.toFixed(2));
    },

    VerifyRating(rating) { //just like verify float must limits range
        rating = this.VerifyFloat(rating);
        if (rating > 5) throw 'rating cannot be greater than 5';
        return rating;
    },

    VerifyEmail(email) {
        //general error checking
        if (!email) throw 'email must be supplied';
        email = this.VerifyString(email, 'email');
        const splitEmail = email.split('@');
        if (splitEmail.length === 1) throw 'email must contain @ symbol';

        //username error checking (username@domains.suffix)
        let username = splitEmail[0];
        if (username.length >= 64) throw 'email username is too long';
        for (let i = 0; i < username.length; i++) {
            if (username.charCodeAt(i) > 127 || invalidUsernameCharacters.includes(username[i])) {
                throw `${username[i]} is an invalid character`;
            }
        }

        //domain and suffix error checking
        let domains = splitEmail[1].split('.');
        if (domains.length === 1) throw 'domains must contain at least one dot';
        let totalLength = 0;
        for (let dom of domains) {
            if (dom.length === 0) throw 'domain cannot contain consecutive dots';
            totalLength += dom.length;
            for (let i = 0; i < dom.length; i++) {
                const charCode = dom.charCodeAt(i);
                if (!(charCode > 47 && charCode < 58) &&
                    !(charCode > 64 && charCode < 91) &&
                    !(charCode > 96 && charCode < 123) &&
                    !(charCode === 45)) {
                    throw 'domains must only contain alphanumeric characters or dashes (-)';
                }
            }
        }
        if (totalLength >= 200) throw 'domain is too long';
        let lastDomain = domains[domains.length - 1];
        if (lastDomain[0] === '-' || lastDomain[lastDomain.length - 1] === '-') {
            throw 'domain suffix cannot begin or end in a dash (-)';
        }
        if (lastDomain.length < 2) throw 'domain suffix must be at least 2 characters long';
        return email;
    },

    VerifyPassword(password) {
        if (!password) throw 'password must be supplied';
        password = this.VerifyString(password, 'password');
        if (password.includes(' ')) throw 'password cannot contain spaces';
        if (password.length < 6) throw 'password must be at least 6 characters long';

        return password;
    },

    VerifyCategory(category) {
        if (!category) throw 'a category must be supplied';
        category = this.VerifyString(category, 'category');
        for (let c of categories) {
            if (category.toLowerCase() === c.toLowerCase()) {
                return c; // ensure db stores category in correct format
            }
        }
        throw 'invalid category';
    },
    VerifyCondition(cond) {
        if (!cond) 'a condition must be supplied';
        cond = this.VerifyString(cond, 'condition');
        for (let c of conditions) {
            if (cond.toLowerCase() === c.toLowerCase()) {
                return c; // ensure db stores category in correct format
            }
        }
        throw 'invalid condition';
    },

    VerifyDay(day, month) { //month and day are already verified ints
        let days31 = [1, 3, 5, 7, 8, 10, 12];
        let days30 = [4, 6, 9, 11];
        let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
            'August', 'September', 'October', 'November', 'December']
        if (day < 1) throw 'Error: invalid day';
        if ((days31.includes(month) && day > 31) ||
            (days30.includes(month) && day > 30) ||
            (month === 2 && input > 28)) {
            throw `Error: There are not ${day} days in ${months[month - 1]}`;
        }
    },

    VerifyDate(date) {
        if (!date) throw 'date must be supplied';
        date = this.VerifyString(date, 'date');
        let monthDayYear = date.split('/');
        if (monthDayYear.length !== 3) throw 'date must be in MM/DD/YYYY format';
        let month = this.VerifyInt(monthDayYear[0]);
        if (month < 1 || month > 12) throw 'Error: invalid month';
        let day = this.VerifyInt(monthDayYear[1]);
        this.VerifyDay(day, month);
        let year = this.VerifyInt(monthDayYear[2]);
        if (month < 10) month = `0${month}`;
        if (day < 10) day = `0${day}`;
        return `${month}/${day}/${year}`;
    },

    VerifyName(name) {
        if (!name) throw 'a name must be supplied';
        name = this.VerifyString(name, 'name');
        for (let i = 0; i < name.length; i++) {
            const charCode = name.charCodeAt(i);
            if (!(charCode > 64 && charCode < 91) &&
                !(charCode > 96 && charCode < 123)) {
                throw 'names can only contain letters';
            }
        }
        return name;
    }
}