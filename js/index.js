const resumeApp = {
    data() {
        return {
            personal: {
                // name: ``,
                // email: ``,
                // phone: ``,
                // address: ``,
            },
            // links,
            // experience,
        };
    },
    async beforeCreate() {
        await fetch("data/0.json")
            .then((response) => {
                return response.json();
            })
            .then((userData) => {
                for (k in userData) {
                    this[k] = userData[k];
                }
                // for (k in userData.personal) {
                //     this.personal[k] = userData.personal[k];
                // }

                // this.personal.name = userData.personal.name;
                // this.personal.email = userData.personal.email;
            });
    },
    computed: {},
    methods: {},
};

function itemClass(item) {
    if (item.subtitle) {
        return "item_rich";
    }
    if (item.name) {
        return "item_normal";
    }
    return "item_simple";
}

Vue.createApp(resumeApp).mount(`#page`);
