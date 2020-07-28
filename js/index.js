const app = new Vue({
    el: "#page",
    data: {
        // personal: {
        //     name,
        //     email,
        //     phone,
        //     address,
        // },
        // links,
        // experience,
    },
    beforeCreate: async function () {
        await fetch("data/0.json")
            .then(function (response) {
                return response.json();
            })
            .then(function (myJson) {
                console.log(myJson);
            });
    },
});
