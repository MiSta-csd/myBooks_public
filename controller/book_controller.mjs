import * as BookList from '../model/booklist_model.mjs' // version 3 with ORM sequelize, postgress

async function showBookList(req, res, next) {
    try {
        const myBooks = await BookList.loadBooks(req.session.username)
        // console.log(myBooks)
        res.render("booklist", { books: myBooks })
    } catch (error) {
        next(error)
    }
}

async function showBookCatalog(req, res, next) {
    try {
        const allBooks = await BookList.loadCatalog();
        // console.log(myBooks)
        res.render("bookcatalog", { books: allBooks })
    } catch (error) {
        next(error)
    }
}

const addBook = async (req, res, next) => {

    try {
        await BookList.addBook({
            "title": req.body["newBookTitle"],
            "author": req.body["newBookAuthor"]
        }, req.session.username)
        next() //επόμενο middleware είναι το showBookList
    }
    catch (error) {
        next(error) //αν έγινε σφάλμα, με το next(error) θα κληθεί το middleware με τις παραμέτρους (error, req, res, next)
    }
}

const deleteBook = async (req, res, next) => {
    const title = req.params.title;
    try {
        // const bookList = new BookList(req.session.username) // deprecated
        await BookList.deleteBook({ title: title }, req.session.username)
        next() //επόμενο middleware είναι το BookController.showBookList
    }
    catch (error) {
        next(error)//αν έγινε σφάλμα, με το next(error) θα κληθεί το middleware με τις παραμέτρους (error, req, res, next)
    }
}

async function showComments(req, res, next) {
    try {
        const book_users = await BookList.loadComments(req.params.title)
        //console.log("Ekana loadComments!")
        var thisBookUser;

        for(var i = 0; i < book_users.length; i++) {
            if(book_users[i].UserName == req.session.username) {
                thisBookUser = book_users[i];
                book_users.splice(i, 1); // remove this users' comment from array
                break;
            }
        }
        // Bad code!
        for(var i = 0; i < book_users.length; i++) {
            if (!(book_users[i].comment)) {
                book_users.splice(i, 1); // remove null comments from array
                i--;
            }
        }
        
        if(!thisBookUser){
            console.log("thisBookUser is null :(");
            throw new Error("Δεν δούλεψε η λούπα book_users")
        }

        var book_info_thisUserComment = {
            title: thisBookUser.BookTitle,
            author: req.params.author,
            comment: thisBookUser.comment
        };
        
        //console.log(book_users)
        
        res.render("commentform", { 
            otherComments: book_users, 
            thisUsersBook: book_info_thisUserComment     
        })
    } catch (error) {
        next(error)
    }
}

const addComment = async (req, res, next) => {
    // console.log(req.body["bookTitle"])
    // console.log(req.body["bookAuthor"])
    // console.log(req.body["bookComment"])
    try {
        await BookList.addOrEditComment(
            {
                "title": req.body["bookTitle"],
                "author": req.body["bookAuthor"]
            },
            req.session.username,
            req.body["bookComment"]
        )
        next() //επόμενο middleware είναι το showBookList ή το showComments
    } catch (error) {
        next(error) //αν έγινε σφάλμα, με το next(error) θα κληθεί το middleware με τις παραμέτρους (error, req, res, next)
    }
}

export { showBookList, addBook, deleteBook, addComment, showComments, showBookCatalog }