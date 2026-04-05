// seat.js
class SeatSelector {
    constructor() {
        // Lấy sector từ URL
        const params = new URLSearchParams(window.location.search);
        this.sectorId = params.get('sector') || 'A1';
        
        // Dữ liệu meta sector (giá, tổng ghế, tên)
        this.sectorMeta = this.loadSectorMeta();
        if (!this.sectorMeta[this.sectorId]) {
            alert('Không tìm thấy thông tin khán đài! Quay lại trang trước.');
            window.location.href = '../1.2_Sân vận động/stadium.html';
            return;
        }
        
        // Dữ liệu ghế đã đặt
        this.bookedSeats = this.loadBookedSeats();
        
        // Dữ liệu ghế còn trống (số lượng)
        this.arenaSeats = this.loadArenaSeats();
        
        // State
        this.selectedSeats = [];
        
        this.initUI();
        this.renderSeatGrid();
        this.attachEvents();
    }
    
    loadSectorMeta() {
        const meta = localStorage.getItem('sectors_meta');
        return meta ? JSON.parse(meta) : {};
    }
    
    loadBookedSeats() {
        const booked = localStorage.getItem('arena_seats_booked');
        if (booked) {
            return JSON.parse(booked);
        }
        // Khởi tạo rỗng
        return {};
    }
    
    loadArenaSeats() {
        const seats = localStorage.getItem('arena_seats');
        if (seats) {
            return JSON.parse(seats);
        }
        // Nếu chưa có, tạo từ meta
        const newSeats = {};
        for (let id in this.sectorMeta) {
            newSeats[id] = this.sectorMeta[id].totalSeats;
        }
        localStorage.setItem('arena_seats', JSON.stringify(newSeats));
        return newSeats;
    }
    
    saveBookedSeats() {
        localStorage.setItem('arena_seats_booked', JSON.stringify(this.bookedSeats));
    }
    
    saveArenaSeats() {
        localStorage.setItem('arena_seats', JSON.stringify(this.arenaSeats));
    }
    
    initUI() {
        document.getElementById('tag-id').innerText = `SECTOR: ${this.sectorId}`;
        document.getElementById('display-sector').innerText = this.sectorMeta[this.sectorId].name || this.sectorId;
        const price = this.sectorMeta[this.sectorId].price;
        document.getElementById('price-per-seat').innerHTML = price.toLocaleString() + ' VND';
        this.updateTotalPrice();
    }
    
    renderSeatGrid() {
        const totalSeats = this.sectorMeta[this.sectorId].totalSeats;
        const grid = document.getElementById('seat-grid');
        grid.innerHTML = '';
        
        // Sắp xếp ghế thành lưới: quyết định số cột (ví dụ 20 cột)
        const cols = 20;
        const rows = Math.ceil(totalSeats / cols);
        grid.style.gridTemplateColumns = `repeat(${cols}, minmax(24px, auto))`;
        
        // Lấy danh sách ghế đã đặt cho sector này
        const bookedForSector = this.bookedSeats[this.sectorId] || [];
        
        for (let i = 1; i <= totalSeats; i++) {
            const seat = document.createElement('div');
            seat.className = 'seat';
            seat.textContent = i; // hiển thị số ghế
            seat.dataset.seatNumber = i;
            
            if (bookedForSector.includes(i)) {
                seat.classList.add('booked');
            }
            
            seat.addEventListener('click', (e) => {
                e.stopPropagation();
                if (seat.classList.contains('booked')) return;
                if (seat.classList.contains('selected')) {
                    seat.classList.remove('selected');
                    this.selectedSeats = this.selectedSeats.filter(n => n !== i);
                } else {
                    seat.classList.add('selected');
                    this.selectedSeats.push(i);
                }
                this.updateSelectedCount();
            });
            
            grid.appendChild(seat);
        }
    }
    
    updateSelectedCount() {
        document.getElementById('selected-count').innerText = this.selectedSeats.length;
        this.updateTotalPrice();
    }
    
    updateTotalPrice() {
        const total = this.selectedSeats.length * this.sectorMeta[this.sectorId].price;
        document.getElementById('total-price').innerHTML = total.toLocaleString() + ' VND';
    }
    
    attachEvents() {
        const confirmBtn = document.getElementById('confirm-btn');
        confirmBtn.addEventListener('click', () => this.confirmBooking());
    }
    
    confirmBooking() {
        if (this.selectedSeats.length === 0) {
            alert('Vui lòng chọn ít nhất một ghế.');
            return;
        }
        
        // Kiểm tra xem các ghế đã chọn có bị đặt trước lúc khác không (an toàn)
        const bookedForSector = this.bookedSeats[this.sectorId] || [];
        const conflict = this.selectedSeats.some(seat => bookedForSector.includes(seat));
        if (conflict) {
            alert('Có ghế vừa được đặt trước đó. Vui lòng tải lại trang và chọn lại.');
            return;
        }
        
        // Xác nhận với người dùng
        const totalPrice = this.selectedSeats.length * this.sectorMeta[this.sectorId].price;
        const confirmMsg = `Bạn đã chọn ${this.selectedSeats.length} ghế tại khu ${this.sectorId}.\nTổng tiền: ${totalPrice.toLocaleString()} VND.\nXác nhận đặt vé?`;
        if (!confirm(confirmMsg)) return;
        
        // Cập nhật dữ liệu
        // 1. Thêm ghế đã chọn vào danh sách booked
        const newBooked = [...bookedForSector, ...this.selectedSeats];
        this.bookedSeats[this.sectorId] = newBooked;
        this.saveBookedSeats();
        
        // 2. Giảm số ghế trống trong arena_seats
        this.arenaSeats[this.sectorId] -= this.selectedSeats.length;
        this.saveArenaSeats();
        
        // 3. Tạo mã vé (ticket ID) và lưu thông tin đặt vé
        const ticketId = this.generateTicketId();
        const bookingInfo = {
            ticketId: ticketId,
            sector: this.sectorId,
            sectorName: this.sectorMeta[this.sectorId].name,
            seats: this.selectedSeats,
            totalPrice: totalPrice,
            event: localStorage.getItem('event') || 'Sự kiện',
            timestamp: new Date().toISOString()
        };
        
        // Lưu danh sách vé đã đặt (key: tickets)
        let tickets = localStorage.getItem('tickets');
        tickets = tickets ? JSON.parse(tickets) : [];
        tickets.push(bookingInfo);
        localStorage.setItem('tickets', JSON.stringify(tickets));
        
        // Đồng thời lưu ticketID vào localStorage để trang chủ có thể tìm
        // (Có thể lưu nhiều, nhưng trang chủ chỉ kiểm tra ID vừa tạo, ta lưu riêng key "lastTicketId")
        localStorage.setItem('lastTicketId', ticketId);
        
        alert(`Đặt vé thành công!\nMã vé của bạn: ${ticketId}\nVui lòng giữ mã này để tra cứu.`);
        
        // Quay về stadium
        window.location.href = '../1.2_Sân vận động/stadium.html';
    }
    
    generateTicketId() {
        // Tạo mã vé ngẫu nhiên 8 ký tự: chữ hoa + số
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', () => {
    new SeatSelector();
});