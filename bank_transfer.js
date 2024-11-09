$(document).ready(function() {
    // Initialize bank transfer datatable
    let transferTable = $('#bank_transfer_table').DataTable({
        processing: true,
        serverSide: true,
        ajax: {
            url: '/api/bank-transfers',
            type: 'GET',
            data: function(d) {
                d.month = $('#transfer_month').val();
                d.year = $('#transfer_year').val();
                d.bank = $('#bank_filter').val();
                d.status = $('#status_filter').val();
            }
        },
        columns: [
            { 
                data: 'select',
                title: '<input type="checkbox" id="select_all_transfers">',
                orderable: false,
                render: function(data, type, row) {
                    return `<input type="checkbox" class="transfer-checkbox" value="${row.id}">`;
                }
            },
            { data: 'employee_id', title: 'Employee ID' },
            { data: 'employee_name', title: 'Employee Name' },
            { data: 'bank_name', title: 'Bank' },
            { data: 'account_number', title: 'Account Number' },
            { data: 'ifsc_code', title: 'IFSC Code' },
            { data: 'transfer_amount', title: 'Transfer Amount' },
            { data: 'status', title: 'Status' },
            { data: 'transfer_date', title: 'Transfer Date' },
            { data: 'actions', title: 'Actions', orderable: false }
        ],
        columnDefs: [
            {
                targets: 6, // amount column
                render: function(data) {
                    return formatCurrency(data);
                }
            },
            {
                targets: 7, // status column
                render: function(data) {
                    const statusClasses = {
                        'pending': 'bg-warning',
                        'processing': 'bg-info',
                        'completed': 'bg-success',
                        'failed': 'bg-danger'
                    };
                    return `<span class="badge ${statusClasses[data.toLowerCase()]}">${data}</span>`;
                }
            },
            {
                targets: 8, // date column
                render: function(data) {
                    return data ? moment(data).format('DD MMM YYYY') : '-';
                }
            },
            {
                targets: -1, // actions column
                render: function(data, type, row) {
                    let actions = `
                        <div class="btn-group">
                            <button class="btn btn-sm btn-info view-details" data-id="${row.id}">
                                <i class="fa fa-eye"></i>
                            </button>`;
                    
                    if (row.status.toLowerCase() === 'failed') {
                        actions += `
                            <button class="btn btn-sm btn-warning retry-transfer" data-id="${row.id}">
                                <i class="fa fa-refresh"></i>
                            </button>`;
                    }
                    
                    actions += `</div>`;
                    return actions;
                }
            }
        ],
        order: [[2, 'asc']],
        pageLength: 25,
        responsive: true,
        footerCallback: function(row, data, start, end, display) {
            calculateTotalTransfer(this.api());
        }
    });

    // Select all checkbox handler
    $('#select_all_transfers').on('change', function() {
        $('.transfer-checkbox').prop('checked', $(this).prop('checked'));
        updateBulkActionButtons();
    });

    // Individual checkbox handler
    $(document).on('change', '.transfer-checkbox', function() {
        updateBulkActionButtons();
    });

    // Initialize process controls
    initializeProcessControls();

    // Filter handlers
    $('.transfer-filter').on('change', function() {
        transferTable.ajax.reload();
    });

    // Process Bank Transfer
    $('#process_bank_transfer').on('click', function() {
        const selectedIds = getSelectedTransfers();
        if (selectedIds.length === 0) {
            showErrorAlert('Please select transfers to process');
            return;
        }

        if (confirm('Are you sure you want to process these bank transfers?')) {
            processBankTransfers(selectedIds);
        }
    });

    function processBankTransfers(transferIds) {
        $.ajax({
            url: '/api/bank-transfers/process',
            method: 'POST',
            data: { transfer_ids: transferIds },
            success: function(response) {
                initializeTransferMonitor(response.batch_id);
                showSuccessAlert('Bank transfer processing started');
            },
            error: function(xhr) {
                showErrorAlert('Error processing bank transfers: ' + xhr.responseJSON.message);
            }
        });
    }

    // Transfer Monitor
    function initializeTransferMonitor(batchId) {
        $('#transfer_status_card').show();
        updateTransferStatus(batchId);
        
        const monitorInterval = setInterval(function() {
            $.ajax({
                url: `/api/bank-transfers/status/${batchId}`,
                method: 'GET',
                success: function(response) {
                    updateTransferUI(response);
                    
                    if (response.status === 'completed' || response.status === 'failed') {
                        clearInterval(monitorInterval);
                        transferTable.ajax.reload();
                        
                        if (response.status === 'completed') {
                            showSuccessAlert('Bank transfers completed successfully');
                        }
                    }
                }
            });
        }, 5000); // Check every 5 seconds
    }

    function updateTransferUI(status) {
        $('#transfer_progress').css('width', status.progress + '%');
        $('#transfer_progress').text(status.progress + '%');
        $('#processed_count').text(status.processed);
        $('#total_count').text(status.total);
        $('#failed_count').text(status.failed);
    }

    // Generate Bank File
    $('#generate_bank_file').on('click', function() {
        const selectedIds = getSelectedTransfers();
        if (selectedIds.length === 0) {
            showErrorAlert('Please select transfers');
            return;
        }

        generateBankFile(selectedIds);
    });

    function generateBankFile(transferIds) {
        $.ajax({
            url: '/api/bank-transfers/generate-file',
            method: 'POST',
            data: { 
                transfer_ids: transferIds,
                bank: $('#bank_filter').val()
            },
            xhrFields: {
                responseType: 'blob'
            },
            success: function(response) {
                const blob = new Blob([response], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `bank_transfer_${moment().format('YYYYMMDD')}.txt`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            },
            error: function(xhr) {
                showErrorAlert('Error generating bank file');
            }
        });
    }

    // View Transfer Details
    $(document).on('click', '.view-details', function() {
        const transferId = $(this).data('id');
        loadTransferDetails(transferId);
    });

    function loadTransferDetails(transferId) {
        $.ajax({
            url: `/api/bank-transfers/${transferId}`,
            method: 'GET',
            success: function(response) {
                showTransferDetailsModal(response);
            },
            error: function(xhr) {
                showErrorAlert('Error loading transfer details');
            }
        });
    }

    function showTransferDetailsModal(details) {
        $('#detail_employee_name').text(details.employee_name);
        $('#detail_employee_id').text(details.employee_id);
        $('#detail_bank_name').text(details.bank_name);
        $('#detail_account_number').text(details.account_number);
        $('#detail_ifsc_code').text(details.ifsc_code);
        $('#detail_transfer_amount').text(formatCurrency(details.transfer_amount));
        $('#detail_status').text(details.status);
        $('#detail_transfer_date').text(details.transfer_date ? 
            moment(details.transfer_date).format('DD MMM YYYY') : '-');
        $('#detail_remarks').text(details.remarks || '-');

        if (details.error_message) {
            $('#error_message_section').show();
            $('#detail_error_message').text(details.error_message);
        } else {
            $('#error_message_section').hide();
        }

        $('#transfer_details_modal').modal('show');
    }

    // Retry Failed Transfer
    $(document).on('click', '.retry-transfer', function() {
        const transferId = $(this).data('id');
        retryTransfer(transferId);
    });

    function retryTransfer(transferId) {
        $.ajax({
            url: `/api/bank-transfers/${transferId}/retry`,
            method: 'POST',
            success: function(response) {
                transferTable.ajax.reload();
                showSuccessAlert('Transfer retry initiated successfully');
            },
            error: function(xhr) {
                showErrorAlert('Error retrying transfer');
            }
        });
    }

    // Export Transfer Report
    $('#export_transfer_report').on('click', function() {
        const format = $('#export_format').val();
        exportTransferReport(format);
    });

    function exportTransferReport(format) {
        const params = {
            month: $('#transfer_month').val(),
            year: $('#transfer_year').val(),
            bank: $('#bank_filter').val(),
            status: $('#status_filter').val(),
            format: format
        };

        $.ajax({
            url: '/api/bank-transfers/export',
            method: 'GET',
            data: params,
            xhrFields: {
                responseType: 'blob'
            },
            success: function(response) {
                const blob = new Blob([response], { 
                    type: format === 'pdf' ? 'application/pdf' : 'application/vnd.ms-excel'
                });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `transfer_report_${params.year}_${params.month}.${format}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            },
            error: function(xhr) {
                showErrorAlert('Error exporting transfer report');
            }
        });
    }

    // Helper Functions
    function getSelectedTransfers() {
        return $('.transfer-checkbox:checked').map(function() {
            return $(this).val();
        }).get();
    }

    function updateBulkActionButtons() {
        const selectedCount = $('.transfer-checkbox:checked').length;
        $('#process_bank_transfer, #generate_bank_file').prop('disabled', selectedCount === 0);
        $('#selected_count').text(selectedCount);
    }

    function calculateTotalTransfer(api) {
        const totalAmount = api
            .column(6)
            .data()
            .reduce((a, b) => parseFloat(b.replace(/[^0-9.-]+/g, '')) + a, 0);

        $('#total_transfer_amount').text(formatCurrency(totalAmount));
    }

    function initializeProcessControls() {
        // Populate months
        const months = moment.months();
        const currentMonth = moment().month();
        
        months.forEach((month, index) => {
            $('#transfer_month').append(
                `<option value="${index + 1}" ${index === currentMonth ? 'selected' : ''}>
                    ${month}
                </option>`
            );
        });

        // Populate years
        const currentYear = moment().year();
        for (let i = currentYear - 2; i <= currentYear; i++) {
            $('#transfer_year').append(
                `<option value="${i}" ${i === currentYear ? 'selected' : ''}>
                    ${i}
                </option>`
            );
        }
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    function showSuccessAlert(message) {
        toastr.success(message);
    }

    function showErrorAlert(message) {
        toastr.error(message);
    }
}); 