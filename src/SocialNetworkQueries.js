export class SocialNetworkQueries {

    constructor({ fetchCurrentUser }) {
        this.fetchCurrentUser = fetchCurrentUser;
    }

    async findPotentialLikes({ minimalScore } = {}) {
        let result = [];
        try {
            const currentUser = await this.fetchCurrentUser();
            if (!currentUser) Promise.resolve({
                books: []
            });
            const likes = currentUser.likes;
            const friends = currentUser.friends || [];
            const myBooks = likes? (likes.books || []) : [];
            if (friends.length > 0) {
                let friendBooks = [];
                for(const friend of friends) {
                    friendBooks = [...friendBooks, ...(friend.likes ? (friend.likes.books || []): [])];
                }
                friendBooks = friendBooks.filter(item => !myBooks.includes(item));
                const potentialLikes = {};
                for (const book of friendBooks) {
                    if (!myBooks.includes(book))
                        potentialLikes[book] = (potentialLikes[book] || 0) + 1;
                }
                
                result = Object.keys(potentialLikes)
                    .sort((title1, title2) => {
                        if (potentialLikes[title1] != potentialLikes[title2]) {
                            return potentialLikes[title2] - potentialLikes[title1]
                        } else {
                            return title1.localeCompare(title2, "en", { sensitivity: "base" })
                        }
                    });

                if (minimalScore > 0) {
                    result = result.filter(title => (potentialLikes[title]/friends.length) >= minimalScore);
                }
            }
           
        } catch (err) {
            console.log("Potentioal Likes finding error: ", err.message);
        }
        return Promise.resolve({
            books: result
        });
    }

}
