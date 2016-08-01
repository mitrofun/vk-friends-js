function getNumberDayInYear(date) {

    let result;

    if (date != '') {
        result = (date - new Date(date.getFullYear(),0,1))/ (60 * 60 * 24 * 1000);
    } else {
        result = ''
    }

    return result
}


function getDateFromString(sDate) {

    let result;
    let currentYear = new Date().getFullYear();

    if (!!sDate && typeof sDate != 'undefined') {

        let y, m, d;

        y = currentYear;
        m = sDate.split('.')[1] - 1;
        d = sDate.split('.')[0];

        result = new Date(y, m, d);
    } else {
        result = ''
    }
    return result;
}

function getNumberDayOnCurrentDay(date) {

    if (date == '') {
        return 1000;
    }

    let result;

    let now = new Date();
    let today = new Date(now.getFullYear(), now.getMonth(), now.getDay());

    let numberToday = getNumberDayInYear(today);

    // console.log('today = ', numberToday);

    result = getNumberDayInYear(date) - numberToday;

    // console.log('result = ', result);

    if (result > 0) {
        return result;
    } else {
        return result + 365;
    }
}

function sortFriendsByBdate(array) {
    array.sort(function (a, b) {

        let x = a._sort;
        let y = b._sort;

        if (x < y) return -1;
        if (x > y) return 1;
        else return 0;
    });
}


function setDays(obj) {

    for (let i = 0; i < obj.response.items.length; i++) {
        let friend = obj.response.items[i];
            friend._sort = getNumberDayOnCurrentDay(getDateFromString(friend.bdate))
    }
}


new Promise(function (resolve) {
    if (document.readyState == 'complete') {
        resolve();
    } else {
        window.onload = resolve;
    }
}).then(function () {
    return new Promise(function (resolve, reject) {
        VK.init({
            apiId: 5570714
        });

        VK.Auth.login(function (response) {
            if (response.session) {
                resolve(response);
            } else {
                reject(new Error('Не удалось авторизоваться'));
            }
        }, 8);
    });
}).then(function () {
     return new Promise(function (resolve, reject) {
        VK.api('friends.get', {v: '5.53', 'fields': 'photo_50, bdate'}, function (serverAnswer) {
            // console.log(serverAnswer);
            let Friends = serverAnswer;

            setDays(Friends);

            sortFriendsByBdate(Friends.response.items);

            // console.log(Friends);

            if (serverAnswer.error) {
                reject(new Error(serverAnswer.error.error_msg));
            } else {
                let source = friendsTemplate.innerHTML;
                let template = Handlebars.compile(source);
                friendsList.innerHTML = template({friend: Friends.response.items});
                resolve();
            }
        });
    });
}).catch(function (e) {
    alert(`Ошибка: ${e.message}`);
});
