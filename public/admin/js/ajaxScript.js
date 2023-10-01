// $(document).ready(function(){
//     function blockButton(){
//         console.log("function clicked");
//     }
// })

// function blockButton(id) {
//     console.log(id);
//     $.ajax({
//         url: '/admin/blockuser',
//         method: "post",
//         data: { id: id },
//         success: function (response) {
//             console.log("Block status updated:", response);

//             // Update the HTML content with the new user data
//             updateHtmlContent(response.users); // Define this function to update the HTML
//         },
//         error: function (error) {
//             console.error("Error:", error);
//         }
//     });
// }

// function updateHtmlContent(users) {
//     const userTable = $('#user-table tbody');

//     // Clear the existing table rows
//     userTable.empty();

//     users.forEach(user => {
//         const statusClass = user.block === 0 ? 'btn-inverse-success' : 'btn-inverse-danger';
//         const buttonText = user.block === 0 ? 'block' : 'unBlock';

//         const newRow = `<tr>
//             <td>
//                 <img src="/user/images/userImages/${user.image || 'dummy-profile-pr.jpg'}" alt="image" />
//                 <span class="pl-2">${user.userName}</span>
//             </td>
//             <td>${user.email}</td>
//             <td>
//                 <span class="pl-2 text-${user.verified === 0 ? 'danger' : 'success'}">${user.verified === 0 ? 'Not verified' : 'verified'}</span>
//             </td>
//             <td>${user.accountOpenAt}</td>
//             <td>
//                 <button onclick="blockButton('${user._id}')" class="btn ${statusClass}">${buttonText}</button>
//             </td>
//             <td>
//                 <a class="btn btn-inverse-info">View Orders</a>
//             </td>
//         </tr>`;

//         userTable.append(newRow);
//     });
// }


// function blockButton(id) {
//     // console.log(id);
//     $.ajax({
//         url: '/admin/blockuser',
//         method: "post",
//         data: { id: id },
//         success: function (response) {
//             // console.log(response.users);
//             let users = response.users
//             let targetUser = users.find((user)=>{
//                 return user._id===id
//             })
//             console.log(targetUser.block);
//             // Assuming that the response contains information about the user's block status
//             if (targetUser.block==0) {
//                 // User is blocked, change button to red
//                 $(`button[data-id="${id}"]`).removeClass('btn-inverse-success').addClass('btn-inverse-danger').text('unBlock');
//             } else {
//                 // User is not blocked, change button to green
//                 $(`button[data-id="${id}"]`).removeClass('btn-inverse-danger').addClass('btn-inverse-success').text('block');
//             }
//         },
//         error: function (error) {
//             console.error("Error:", error);
//         }
//     });
// }


function blockButton(id) {
    // Send an AJAX request to update the user's block status
    $.ajax({
        url: '/admin/blockuser',
        method: "post",
        data: { id: id },
        success: function (response) {
            let users = response.users;
            let targetUser = users.find((user) => {
                return user._id === id;
            });

            // Update the button class and text based on the user's block status
            if (targetUser.block == 0) {
                $(`button[data-id="${id}"]`).removeClass('btn-inverse-danger').addClass('btn-inverse-success').text('block');
            } else {
                $(`button[data-id="${id}"]`).removeClass('btn-inverse-success').addClass('btn-inverse-danger').text('unBlock');
            }
        },
        error: function (error) {
            console.error("Error:", error);
        }
    });
}


function blockCategory(id) {
    console.log("clicked....");
    $.ajax({
        url: '/admin/category/block',
        method: "post",
        data: { id: id },
        success: function (response) {
            let categories = response.categories;
            let targetCategory = categories.find((cate) => {
                return cate._id === id;
            });

            // Update the button class and text based on the user's block status
            if (targetCategory.block == 0) {
                $(`button[data-id="${id}"]`).removeClass('btn-inverse-warning').addClass('btn-inverse-success').text('block');
            } else {
                $(`button[data-id="${id}"]`).removeClass('btn-inverse-success').addClass('btn-inverse-warning').text('unBlock');
            }
        },
        error: function (error) {
            console.error("Error:", error);
        }
    });
}
