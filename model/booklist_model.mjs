import { Book, User, BookUser } from './bookList_seq_pg.mjs'
import bcrypt from 'bcrypt'

async function addUser(username, password) {
    try {
        if (!username || !password)
            throw new Error("Λείπει το όνομα ή το συνθηματικό του χρήστη")

        let user = await User.findOne({ where: { name: username } })

        if (user)
            throw new Error("Υπάρχει ήδη χρήστης με όνομα " + username)

        const hash = await bcrypt.hash(password, 10)
        user = await User.create({ name: username, password: hash })
        return user
    } catch (error) {
        throw error
    }
}

async function login(username, password) {
    try {
        if (!username || !password)
            throw new Error("Λείπει το όνομα ή το συνθηματικό του χρήστη")

        let user = await User.findOne({ where: { name: username } })

        if (!user)
            throw new Error("Δεν υπάρχει χρήστης με όνομα " + username)

        const match = await bcrypt.compare(password, user.password)
        if (match)
            return user
        else
            throw new Error("Λάθος στοιχεία πρόσβασης")
    } catch (error) {
        throw error
    }
}

async function loadBooks(username) {
    try {
        if (!username)
            throw new Error("Πρέπει να δοθεί όνομα χρήστη")

        const user = await User.findOne({ where: { name: username } });
        if (!user)
            throw new Error("άγνωστος χρήστης")

        const myBooks = await user.getBooks({ raw: true }); //με raw επιστρέφεται το "καθαρό" αντικείμενο (ο πίνακας) χωρίς πληροφορίες που αφορούν τη sequelize  
        return myBooks
    } catch (error) {
        throw error
    }
}

async function addBook(newBook, username) {
    try {
        if (!username)
            throw new Error("Πρέπει να δοθεί όνομα χρήστη")

        const user = await User.findOne({ where: { name: username } });
        if (!user)
            throw new Error("άγνωστος χρήστης")

        const [book, created] = await Book.findOrCreate({
            where: {
                title: newBook.title,
                author: newBook.author
            }
        })
        await user.addBook(book)
    } catch (error) {
        throw error
    }
}

// το βιβλίο διαγράφεται από τον πίνακα "BookUser" // Deprecated..
/* async function deleteBook(book) {
    try {
        await this.findOrAddUser()
        const bookToRemove = await Book.findOne(
            { where: { title: book.title } }
        )
        await bookToRemove.removeUser(this.user)
        // this.user.removeBook(bookToRemove) // εναλλακτικά, από την πλευρά του User

        // Αν δεν υπάρχουν άλλοι χρήστες, διαγράφουμε το βιβλίο
        const numberOfUsers = await bookToRemove.countUsers()
        if (numberOfUsers == 0) {
            Book.destroy(
                { where: { title: book.title } }
            )
        }
    } catch (error) {
        throw error
    }
} */

async function deleteBook(book, username) {
    try {
        if (!username)
            throw new Error("Πρέπει να δοθεί όνομα χρήστη")

        const user = await User.findOne({ where: { name: username } });
        if (!user)
            throw new Error("άγνωστος χρήστης")

        const booktoRemove = await Book.findOne(
            { where: { title: book.title } }
        )
        await booktoRemove.removeUser(user)
        const numofUsers = await booktoRemove.countUsers()
        if (numofUsers == 0) {
            Book.destroy({where: {title: book.title}})
        }
    }catch (error) {
        throw error
    }
}

async function loadComments(title) {
    try {
        if (!title)
            throw new Error("Πρέπει να δοθεί το όνομα του βιβλίου")

        const book_users = await BookUser.findAll({ where: { BookTitle: title }, raw: true });
        if (!book_users)
            throw new Error("Δεν υπάρχει κατάλληλο ζευγάρι χρήστη-βιβλίου")
        //console.log(book_users)
        return book_users 
    } catch (error) {
        throw error
    }
}

async function addOrEditComment(book, username, u_comment) {
    try {
        if (!username)
            throw new Error("Πρέπει να δοθεί όνομα χρήστη")

        const book_user = await BookUser.findOne({ 
            where: {
                UserName: username,
                BookTitle: book.title
            } 
        })
        if (!book_user)
            throw new Error("Δεν υπάρχει κατάλληλο ζευγάρι χρήστη-βιβλίου")
        
        let u_comment_trim = u_comment.trim(); // clearing whitespaces
        
        // This seems superfluous
        if(!u_comment_trim)
            u_comment = null

        await BookUser.update({ comment: u_comment }, {
            where: {
                UserName: username,
                BookTitle: book.title
            }
        })

    } catch (error) {
        throw error
    }
}

async function findOrAddUser() {
    //στο this.user θα φυλάσσεται το αντικείμενο που αντιπροσωπεύει τον χρήστη στη sequelize
    //αν δεν υπάρχει, τότε το ανακτούμε από τη sequalize
    //αλλιώς, υπάρχει το this.user και δεν χρειάζεται να κάνουμε κάτι άλλο
    if (this.user == undefined)
        try {
            const [user, created] = await User.findOrCreate({ where: { name: this.username } })
            this.user = user
        } catch (error) {
            throw error
        }
}

export { addUser, login, loadBooks, addBook, deleteBook, 
    addOrEditComment, loadComments }