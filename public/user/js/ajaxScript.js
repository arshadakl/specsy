function addCart(id,user) {
    function showAlertBox() {
        console.log("alert fun called...");
        $("#cartAlert").fadeIn();
    
        // Hide the alert box after 5 seconds
        setTimeout(function () {
            $("#cartAlert").fadeOut();
        }, 3000);
    }

    function showAlertBoxAlready() {
        console.log("alert fun called...");
        $("#cartAlertAlready").fadeIn();
    
        // Hide the alert box after 5 seconds
        setTimeout(function () {
            $("#cartAlertAlready").fadeOut();
        }, 3000);
    }



 
    if(user){
        $.ajax({
            url: '/addtocart',
            method: "post",
            data: { id: id,user:user },
            success: function (response) {
                console.log(response);
                if(response.cart==1){
                    showAlertBox()
                }
                if(response.cart==2){
                    showAlertBoxAlready()
                }
               
            },
            error: function (error) {
                console.error("Error:", error);
            }
        });
    }else{
        window.location.href = "/login"
    }
}




function changeQty(userId,productId,qty){
    // console.log(qty);
    let totalDis = document.getElementById('totalDisplay')
    let subTotalDis = document.getElementById('subTotalDisplay')
    let singleProductTotal = document.getElementById(`singleProductTotal${productId}`)
    let qtyInput = document.getElementById(`qty${productId}`)
    let singleProductPrice =  document.getElementById(`singleProductPrice${productId}`)
    if(userId){
        $.ajax({
            url:'/changeqty',
            method:'post',
            data:{userId,productId,qty:qty},
            success:(response)=>{
                // alert(response)
                // console.log(response);
                
                response.total==undefined ? window.location.href='/login' :

                totalDis.innerHTML=response.total
                subTotalDis.innerHTML=response.total

                // console.log(response.cartItems.products);
                let newQuantity = response.cartItems.products.find(val=>val.product==productId)
                console.log(newQuantity);
                qtyInput.value=newQuantity.quantity
                singleProductTotal.innerHTML=`₹${Number(singleProductPrice.innerHTML)*Number(newQuantity.quantity)}`
                console.log(singleProductPrice.innerHTML);
                
            }
    })
    }
}


function removeCartItem(user,product){
    console.log(user,product);
    $.ajax({
        url:'/removecartproduct',
        method:'delete',
        data:{user,product},
        success:(response)=>{
            console.log(response);
            if(response.remove==1){
                location.reload()
            }
        }
    })
}