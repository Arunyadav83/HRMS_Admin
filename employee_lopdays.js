$(document).ready(function() {
    // Initialize LOP days datatable
    let lopTable = $('#employee_lop_table').DataTable({
        processing: true,
        serverSide: true,
        ajax: {
            url: '/api/employee-lop',
            type: 'GET',
            data: function(d) {
                d.year = $('#lop_year').val();
                d.month = $('#lop_month').val();
                d.department = $('#department_filter').val();
                d.status = $('#status_filter').val();
            }
        },
        columns: [
            { data: 'employee_id', title: 'Employee ID' },
            { data: 'employee_name', title: 'Employee Name' },
            { data: 'department', title: 'Department' },
            { data: 'lop_days', title: 'LOP Days' },
            { data: 'from_date', title: 'From Date' },
            { data: 'to_date', title: 'To Date' },
            { data: 'reason', title: 'Reason' },
            { data: 'status', title: 'Status' },
            { data: 'deduction_amount', title: 'Deduction Amount' },
            { data: 'actions', title: 'Actions', orderable: false }
        ],
        columnDefs: [
            {
                targets: 3, // lop_days column
                render: function(data) {
                    return `<span class="badge bg-danger">${data} days</span>`;
                }
            },
            {
                targets: [4, 5], // date columns
                render: function(data) {
                    return moment(data).format('DD MMM YYYY');
                }
            },
            {
                targets: 7, // status column
                render: function(data) {
                    const statusClasses = {
                        'pending': 'bg-warning',
                        'approved': 'bg-success',
                        'rejected': 'bg-danger'
                    };
                    return `<span class="badge ${statusClasses[data.toLowerCase()]}">${data}</span>`;
                }
            },
            {
                targets: 8, // deduction amount column
                render: function(data) {
                    return formatCurrency(data);
                }
            },
            {
                targets: -1, // actions column
                render: function(data, type, row) {
                    let actions = `
                        <div class="btn-group">
                            <button class="btn btn-sm btn-info view-lop" data-id="${row.id}">
                                <i class="fa fa-eye"></i>
                            </button>`;
                    
                    if (row.status.toLowerCase() === 'pending') {
                        actions += `
                            <button class="btn btn-sm btn-success approve-lop" data-id="${row.id}">
                                <i class="fa fa-check"></i>
                            </button>
                            <button class="btn btn-sm btn-danger reject-lop" data-id="${row.id}">
                                <i class="fa fa-times"></i>
                            </button>`;
                    }
                    
                    actions += `</div>`;
                    return actions;
                }
            }
        ],
        order: [[4, 'desc']], // Sort by from_date by default
        pageLength: 25,
        responsive: true,
        footerCallback: function(row, data, start, end, display) {
            calculateTotalLOP(this.api());
        }
    });

    // Filter handlers
    $('.lop-filter').on('change', function() {
        lopTable.ajax.reload();
    });

    // Add new LOP entry
    $('#add_lop_form').on('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            employee_id: $('#employee_id').val(),
            from_date: $('#from_date').val(),
            to_date: $('#to_date').val(),
            reason: $('#lop_reason').val(),
            notes: $('#lop_notes').val()
        };

        $.ajax({
            url: '/api/employee-lop',
            method: 'POST',
            data: formData,
            success: function(response) {
                $('#add_lop_modal').modal('hide');
                lopTable.ajax.reload();
                showSuccessAlert('LOP entry added successfully');
            },
            error: function(xhr) {
                showErrorAlert('Error adding LOP entry: ' + xhr.responseJSON.message);
            }
        });
    });

    // Calculate LOP days automatically
    $('#from_date, #to_date').on('change', function() {
        calculateLOPDays();
    });

    function calculateLOPDays() {
        const fromDate = moment($('#from_date').val());
        const toDate = moment($('#to_date').val());
        
        if (fromDate.isValid() && toDate.isValid()) {
            const days = toDate.diff(fromDate, 'days') + 1;
            $('#lop_days').val(days);
            calculateEstimatedDeduction(days);
        }
    }

    function calculateEstimatedDeduction(days) {
        const employeeId = $('#employee_id').val();
        
        $.ajax({
            url: '/api/employee-lop/calculate-deduction',
            method: 'GET',
            data: {
                employee_id: employeeId,
                days: days
            },
            success: function(response) {
                $('#estimated_deduction').text(formatCurrency(response.deduction_amount));
            }
        });
    }

    // View LOP details
    $(document).on('click', '.view-lop', function() {
        const lopId = $(this).data('id');
        
        $.ajax({
            url: `/api/employee-lop/${lopId}`,
            method: 'GET',
            success: function(response) {
                showLOPDetailsModal(response);
            },
            error: function(xhr) {
                showErrorAlert('Error loading LOP details');
            }
        });
    });

    // Approve/Reject handlers
    $(document).on('click', '.approve-lop', function() {
        const lopId = $(this).data('id');
        updateLOPStatus(lopId, 'approved');
    });

    $(document).on('click', '.reject-lop', function() {
        const lopId = $(this).data('id');
        $('#reject_lop_id').val(lopId);
        $('#reject_lop_modal').modal('show');
    });

    // Reject form submission
    $('#reject_lop_form').on('submit', function(e) {
        e.preventDefault();
        
        const lopId = $('#reject_lop_id').val();
        const rejectReason = $('#reject_reason').val();
        
        updateLOPStatus(lopId, 'rejected', rejectReason);
    });

    // Helper Functions
    function updateLOPStatus(lopId, status, reason = '') {
        $.ajax({
            url: `/api/employee-lop/${lopId}/status`,
            method: 'PUT',
            data: {
                status: status,
                reason: reason
            },
            success: function(response) {
                $('#reject_lop_modal').modal('hide');
                lopTable.ajax.reload();
                showSuccessAlert(`LOP ${status} successfully`);
            },
            error: function(xhr) {
                showErrorAlert(`Error updating LOP status`);
            }
        });
    }

    function showLOPDetailsModal(lop) {
        $('#detail_employee_name').text(lop.employee_name);
        $('#detail_department').text(lop.department);
        $('#detail_lop_days').text(lop.lop_days + ' days');
        $('#detail_from_date').text(moment(lop.from_date).format('DD MMM YYYY'));
        $('#detail_to_date').text(moment(lop.to_date).format('DD MMM YYYY'));
        $('#detail_reason').text(lop.reason);
        $('#detail_status').text(lop.status);
        $('#detail_deduction').text(formatCurrency(lop.deduction_amount));
        $('#detail_applied_date').text(moment(lop.created_at).format('DD MMM YYYY HH:mm'));
        
        $('#lop_details_modal').modal('show');
    }

    function calculateTotalLOP(api) {
        const totalDays = api
            .column(3)
            .data()
            .reduce((a, b) => parseInt(b.replace(/[^0-9]/g, '')) + a, 0);

        const totalDeduction = api
            .column(8)
            .data()
            .reduce((a, b) => parseFloat(b.replace(/[^0-9.-]+/g, '')) + a, 0);

        $('#total_lop_days').text(totalDays + ' days');
        $('#total_lop_deduction').text(formatCurrency(totalDeduction));
    }

    // Export functionality
    $('#export_lop_report').on('click', function() {
        const format = $('#export_format').val();
        exportLOPReport(format);
    });

    function exportLOPReport(format) {
        const params = {
            year: $('#lop_year').val(),
            month: $('#lop_month').val(),
            department: $('#department_filter').val(),
            status: $('#status_filter').val(),
            format: format
        };

        $.ajax({
            url: '/api/employee-lop/export',
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
                a.download = `lop_report_${params.year}_${params.month}.${format}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            },
            error: function(xhr) {
                showErrorAlert('Error exporting LOP report');
            }
        });
    }

    // Utility functions
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