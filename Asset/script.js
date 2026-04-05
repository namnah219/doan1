// ===============================
// 🎯 GLOBAL
// ===============================
let selectedSeats = [];

// ===============================
// 🟢 1. CHỌN SỰ KIỆN
// ===============================
function goToStadium(eventName){
localStorage.setItem("event", eventName);
window.location.href = "./stadium.html";
}

// ===============================
// 🟡 2. CHỌN KHÁN ĐÀI
// ===============================
function selectStand(stand){
localStorage.setItem("stand", stand);
window.location.href = "./seat.html";
}

// ===============================
// 💺 3. LOAD GHẾ + DISABLE
// ===============================
function loadSeats(){

```
let seats = document.querySelectorAll(".seat");

seats.forEach(seat => {
    let id = seat.id;

    if(localStorage.getItem("seat_" + id)){
        seat.classList.add("taken");
    }
});

updateStats();
```

}

// ===============================
// 🎬 4. CHỌN GHẾ (MULTI + ANIMATION)
// ===============================
function selectSeat(seatID){

```
let el = document.getElementById(seatID);

// ❌ ghế đã đặt
if(localStorage.getItem("seat_" + seatID)){
    alert("Ghế đã có người đặt!");
    return;
}

// toggle chọn nhiều ghế
if(selectedSeats.includes(seatID)){
    selectedSeats = selectedSeats.filter(s => s !== seatID);
    el.classList.remove("active");
} else {
    selectedSeats.push(seatID);
    el.classList.add("active");
}

// animation click
el.classList.add("clicked");
setTimeout(() => el.classList.remove("clicked"), 200);

// lưu ghế
localStorage.setItem("seat", JSON.stringify(selectedSeats));

updateStats();
```

}

// ===============================
// 📊 5. THỐNG KÊ GHẾ
// ===============================
function updateStats(){

```
let total = document.querySelectorAll(".seat").length;
let taken = 0;

document.querySelectorAll(".seat").forEach(seat => {
    if(localStorage.getItem("seat_" + seat.id)){
        taken++;
    }
});

let selected = selectedSeats.length;

let el = document.getElementById("stats");

if(el){
    el.innerHTML = `
    🎫 Tổng: ${total} |
    ❌ Đã đặt: ${taken} |
    ✅ Đang chọn: ${selected}
    `;
}
```

}

// ===============================
// 🎫 6. TẠO ID RANDOM
// ===============================
function generateTicketID(){
let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
let id = "";
for(let i = 0; i < 8; i++){
id += chars[Math.floor(Math.random() * chars.length)];
}
return id;
}

// ===============================
// 📄 7. SUBMIT FORM
// ===============================
function submitForm(){

```
let name = document.getElementById("name").value;
let phone = document.getElementById("phone").value;
let address = document.getElementById("address").value;
let birth = document.getElementById("birth").value;
let quantity = document.getElementById("quantity").value;
let type = document.getElementById("type").value;

let event = localStorage.getItem("event");
let stand = localStorage.getItem("stand");
let seats = JSON.parse(localStorage.getItem("seat"));

if(!name || !phone || !seats || seats.length === 0){
    alert("Vui lòng nhập đủ thông tin!");
    return;
}

let id = generateTicketID();

let ticket = {
    id,
    event,
    stand,
    seats,
    name,
    phone,
    address,
    birth,
    quantity,
    type,
    time: new Date().toLocaleString()
};

// lưu vé
localStorage.setItem(id, JSON.stringify(ticket));
localStorage.setItem("currentID", id);

// đánh dấu ghế đã đặt
seats.forEach(s => {
    localStorage.setItem("seat_" + s, "taken");
});

window.location.href = "../1.4_ID/id.html";
```

}

// ===============================
// 🆔 8. HIỂN THỊ VÉ
// ===============================
function showTicket(){

```
let id = localStorage.getItem("currentID");
let el = document.getElementById("ticketInfo");

if(!id || !el) return;

let data = JSON.parse(localStorage.getItem(id));

if(data){
    el.innerHTML = `
    🎫 ID: ${data.id} <br>
    👤 ${data.name} <br>
    📱 ${data.phone} <br>
    🏠 ${data.address} <br>
    🎂 ${data.birth} <br>

    🎵 ${data.event} <br>
    🏟️ ${data.stand} <br>
    💺 ${data.seats.join(", ")} <br>

    🎟️ ${data.type} <br>
    🔢 ${data.quantity} vé <br>

    ⏰ ${data.time}
    `;
}
```

}

// ===============================
// 🔍 9. TRA CỨU VÉ
// ===============================
function searchTicket(){

```
let id = document.getElementById("searchID").value.trim();
let result = document.getElementById("result");

let data = localStorage.getItem(id);

if(!data){
    result.innerHTML = "❌ Không tìm thấy vé!";
    result.style.color = "red";
    return;
}

let t = JSON.parse(data);

result.innerHTML = `
    🎫 ${t.id} <br>
    👤 ${t.name} <br>
    💺 ${t.seats.join(", ")} <br>
    🏟️ ${t.stand} <br>
    🎵 ${t.event} <br>
    🎟️ ${t.type} <br>
    🔢 ${t.quantity} vé <br>
    ⏰ ${t.time}
`;

result.style.color = "lightgreen";
```

}

// ===============================
// 🔄 10. REAL-TIME (đa tab)
// ===============================
window.addEventListener("storage", function(){
loadSeats();
});

// ===============================
// 🚀 AUTO LOAD
// ===============================
window.onload = function(){
loadSeats();
showTicket();
};
