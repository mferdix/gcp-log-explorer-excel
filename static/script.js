let currentPage = 1;
const rowsPerPage = 10;
let currentData = [];

async function uploadCSV(event) {
    event.preventDefault();

    const form = document.getElementById('uploadForm');
    const formData = new FormData(form);

    // Show loading bar
    document.getElementById('uploadProgress').classList.remove('d-none');
    document.getElementById('uploadMessage').textContent = '';
    document.getElementById('uploadMessage').className = '';

    try {
        const res = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        if (res.ok) {
            document.getElementById('uploadMessage').textContent = '✅ Upload berhasil';
            document.getElementById('uploadMessage').className = 'text-success mt-2 fw-bold';
            await search();
        } else {
            throw new Error();
        }
    } catch (err) {
        document.getElementById('uploadMessage').textContent = '❌ Upload gagal';
        document.getElementById('uploadMessage').className = 'text-danger mt-2 fw-bold';
    } finally {
        document.getElementById('uploadProgress').classList.add('d-none');
        form.reset();
    }
}

async function search() {
    const keyword = document.getElementById('keyword').value;
    const params = new URLSearchParams({ keyword });

    const res = await fetch(`/search?${params.toString()}`);
    const data = await res.json();

    currentData = data;
    currentPage = 1;
    displayPage(currentPage);
}

function displayPage(page) {
    const tbody = document.querySelector("#resultTable tbody");
    tbody.innerHTML = "";

    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = currentData.slice(start, end);

    if (pageData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">❗ Tidak ditemukan data sesuai pencarian</td></tr>`;
    } else {
        pageData.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row['protoPayload.authenticationInfo.principalEmail'] || ''}</td>
                <td>${row['protoPayload.requestMetadata.callerSuppliedUserAgent'] || ''}</td>
                <td>${row['protoPayload.requestMetadata.callerIp'] || ''}</td>
                <td>${row['timestamp'] || ''}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Update pagination controls
    document.getElementById('pageInfo').textContent = `Page ${page}`;
    document.getElementById('prevPage').disabled = page === 1;
    document.getElementById('nextPage').disabled = end >= currentData.length;
}

function changePage(page) {
    if (page < 1) return;
    if ((page - 1) * rowsPerPage >= currentData.length) return;

    currentPage = page;
    displayPage(page);
}

function resetFilter() {
    document.getElementById('keyword').value = '';
    search();
}

function excludeInternalIP() {
    if (!currentData.length) {
        alert("⚠️ Data belum diupload atau kosong.");
        return;
    }

    const filtered = currentData.filter(row => {
        const ip = row['protoPayload.requestMetadata.callerIp'] || '';
        return !ip.startsWith('10.');
    });

    if (filtered.length === 0) {
        alert("ℹ️ Tidak ada IP selain dari 10.x.x.x");
        return;
    }

    currentData = filtered;
    currentPage = 1;
    displayPage(currentPage);
}

window.onload = () => {
    search();
};