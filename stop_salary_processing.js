$(document).ready(function() {
    // Initialize salary stop datatable
    let stopSalaryTable = $('#stop_salary_table').DataTable({
        processing: true,
        serverSide: true,
        ajax: {
            url: '/api/salary-stops',
            type: 'GET',
            data: function(d) {
                d.month = $('#process_month').val();
                d.year = $('#process_year').val();
                d.department = $('#department_filter').val();
                d.status = $('#status_filter').val();
            }
        },
        columns: [
            { data: 'employee_id', title: 'Employee ID' },
            { data: 'employee_name', title: 'Employee Name' },
            { data: 'department', title: 'Department' },
            { data: 'stop_reason', title: 'Stop Reason' },
            { data: 'effective_from', title: 'Effective From' },
            { data: 'effective_to', title: 'Effective To' },
            { data: 'requested_by', title: 'Requested By' },
            { data: 'status', title: 'Status' },
            { data: 'actions', title: 'Actions', orderable: false }
        ],
        columnDefs: [
            {
                targets: [4, 5], // date columns
                render: function(data) {
                    return data ? moment(data).format('DD MMM YYYY') : '-';
                }
            },
            {
                targets: 7, // status column
                render: function(data) {
                    const statusClasses = {
                        'pending': 'bg-warning',
                        'active': 'bg-danger',
                        'completed': 'bg-success',
                        'cancelled': 'bg-secondary'
                    };
                    return `<span class="badge ${statusClasses[data.toLowerCase()]}">${data}</span>`;
                }
            },
            {
                targets: -1, // actions column
                render: function(data, type, row) {
                    let actions = `
                        <div class="btn-group">
                            <button class="btn btn-sm btn-info view-stop" data-id="${row.id}">
                                <i class="fa fa-eye"></i>
                            </button>`;
                    
                    if (row.status.toLowerCase() === 'pending') {
                        actions += `
                            <button class="btn btn-sm btn-success approve-stop" data-id="${row.id}">
                                <i class="fa fa-check"></i>
                            </button>
                            <button class="btn btn-sm btn-danger reject-stop" data-id="${row.id}">
                                <i class="fa fa-times"></i>
                            </button>`;
                    } else if (row.status.toLowerCase() === 'active') {
                        actions += `
                            <button class="btn btn-sm btn-warning cancel-stop" data-id="${row.id}">
                                <i class="fa fa-ban"></i>
                            </button>`;
                    }
                    
                    actions += `</div>`;
                    return actions;
                }
            }
        ],
        order: [[4, 'desc']], // Sort by effective_from by default
        pageLength: 25,
        responsive: true
    });

    // Filter handlers
    $('.salary-stop-filter').on('change', function() {
        stopSalaryTable.ajax.reload();
    });

    // Add new salary stop request
    $('#add_salary_stop_form').on('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            employee_id: $('#employee_id').val(),
            stop_reason: $('#stop_reason').val(),
            effective_from: $('#effective_from').val(),
            effective_to: $('#effective_to').val(),
            remarks: $('#stop_remarks').val(),
            documents: getUploadedDocuments()
        };

        $.ajax({
            url: '/api/salary-stops',
            method: 'POST',
            data: formData,
            success: function(response) {
                $('#add_stop_modal').modal('hide');
                stopSalaryTable.ajax.reload();
                showSuccessAlert('Salary stop request created successfully');
            },
            error: function(xhr) {
                showErrorAlert('Error creating salary stop request: ' + xhr.responseJSON.message);
            }
        });
    });

    // View salary stop details
    $(document).on('click', '.view-stop', function() {
        const stopId = $(this).data('id');
        
        $.ajax({
            url: `/api/salary-stops/${stopId}`,
            method: 'GET',
            success: function(response) {
                showStopDetailsModal(response);
            },
            error: function(xhr) {
                showErrorAlert('Error loading stop details');
            }
        });
    });

    // Approve/Reject handlers
    $(document).on('click', '.approve-stop', function() {
        const stopId = $(this).data('id');
        updateStopStatus(stopId, 'active');
    });

    $(document).on('click', '.reject-stop', function() {
        const stopId = $(this).data('id');
        $('#reject_stop_id').val(stopId);
        $('#reject_stop_modal').modal('show');
    });

    // Cancel salary stop
    $(document).on('click', '.cancel-stop', function() {
        const stopId = $(this).data('id');
        $('#cancel_stop_id').val(stopId);
        $('#cancel_stop_modal').modal('show');
    });

    // Reject form submission
    $('#reject_stop_form').on('submit', function(e) {
        e.preventDefault();
        
        const stopId = $('#reject_stop_id').val();
        const rejectReason = $('#reject_reason').val();
        
        updateStopStatus(stopId, 'rejected', rejectReason);
    });

    // Cancel form submission
    $('#cancel_stop_form').on('submit', function(e) {
        e.preventDefault();
        
        const stopId = $('#cancel_stop_id').val();
        const cancelReason = $('#cancel_reason').val();
        
        updateStopStatus(stopId, 'cancelled', cancelReason);
    });

    // Document upload handling
    let uploadedDocuments = [];

    $('#stop_documents').on('change', function(e) {
        const files = e.target.files;
        handleDocumentUpload(files);
    });

    function handleDocumentUpload(files) {
        const formData = new FormData();
        for (let file of files) {
            formData.append('documents[]', file);
        }

        $.ajax({
            url: '/api/salary-stops/upload-documents',
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                uploadedDocuments = uploadedDocuments.concat(response.documents);
                updateDocumentsList();
            },
            error: function(xhr) {
                showErrorAlert('Error uploading documents');
            }
        });
    }

    function updateDocumentsList() {
        const documentsList = uploadedDocuments.map(doc => `
            <div class="document-item">
                <span>${doc.name}</span>
                <button type="button" class="btn btn-sm btn-danger remove-document" data-id="${doc.id}">
                    <i class="fa fa-times"></i>
                </button>
            </div>
        `).join('');

        $('#documents_list').html(documentsList);
    }

    // Helper Functions
    function updateStopStatus(stopId, status, reason = '') {
        $.ajax({
            url: `/api/salary-stops/${stopId}/status`,
            method: 'PUT',
            data: {
                status: status,
                reason: reason
            },
            success: function(response) {
                $('#reject_stop_modal, #cancel_stop_modal').modal('hide');
                stopSalaryTable.ajax.reload();
                showSuccessAlert(`Salary stop ${status} successfully`);
            },
            error: function(xhr) {
                showErrorAlert(`Error updating salary stop status`);
            }
        });
    }

    function showStopDetailsModal(stop) {
        $('#detail_employee_name').text(stop.employee_name);
        $('#detail_department').text(stop.department);
        $('#detail_stop_reason').text(stop.stop_reason);
        $('#detail_effective_from').text(moment(stop.effective_from).format('DD MMM YYYY'));
        $('#detail_effective_to').text(stop.effective_to ? moment(stop.effective_to).format('DD MMM YYYY') : '-');
        $('#detail_requested_by').text(stop.requested_by);
        $('#detail_requested_date').text(moment(stop.created_at).format('DD MMM YYYY HH:mm'));
        $('#detail_status').text(stop.status);
        $('#detail_remarks').text(stop.remarks || '-');
        
        // Render documents
        const documentsList = stop.documents.map(doc => `
            <li>
                <a href="${doc.url}" target="_blank">${doc.name}</a>
            </li>
        `).join('');
        $('#detail_documents').html(documentsList || '<li>No documents attached</li>');
        
        $('#stop_details_modal').modal('show');
    }

    // Export functionality
    $('#export_stops_report').on('click', function() {
        const format = $('#export_format').val();
        exportStopsReport(format);
    });

    function exportStopsReport(format) {
        const params = {
            month: $('#process_month').val(),
            year: $('#process_year').val(),
            department: $('#department_filter').val(),
            status: $('#status_filter').val(),
            format: format
        };

        $.ajax({
            url: '/api/salary-stops/export',
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
                a.download = `salary_stops_${params.year}_${params.month}.${format}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            },
            error: function(xhr) {
                showErrorAlert('Error exporting stops report');
            }
        });
    }

    // Utility functions
    function getUploadedDocuments() {
        return uploadedDocuments.map(doc => doc.id);
    }

    function showSuccessAlert(message) {
        toastr.success(message);
    }

    function showErrorAlert(message) {
        toastr.error(message);
    }
}); 