$(document).ready(function() {
    // Initialize IT declaration datatable
    let declarationTable = $('#it_declaration_table').DataTable({
        processing: true,
        serverSide: true,
        ajax: {
            url: '/api/it-declarations',
            type: 'GET',
            data: function(d) {
                d.financial_year = $('#financial_year').val();
                d.department = $('#department_filter').val();
                d.status = $('#status_filter').val();
            }
        },
        columns: [
            { 
                data: 'select',
                title: '<input type="checkbox" id="select_all_declarations">',
                orderable: false,
                render: function(data, type, row) {
                    return `<input type="checkbox" class="declaration-checkbox" value="${row.id}">`;
                }
            },
            { data: 'employee_id', title: 'Employee ID' },
            { data: 'employee_name', title: 'Employee Name' },
            { data: 'pan_number', title: 'PAN Number' },
            { data: 'declared_amount', title: 'Declared Amount' },
            { data: 'submitted_amount', title: 'Submitted Amount' },
            { data: 'pending_amount', title: 'Pending Amount' },
            { data: 'status', title: 'Status' },
            { data: 'last_updated', title: 'Last Updated' },
            { data: 'actions', title: 'Actions', orderable: false }
        ],
        columnDefs: [
            {
                targets: [4, 5, 6], // amount columns
                render: function(data) {
                    return formatCurrency(data);
                }
            },
            {
                targets: 7, // status column
                render: function(data) {
                    const statusClasses = {
                        'draft': 'bg-secondary',
                        'submitted': 'bg-warning',
                        'verified': 'bg-success',
                        'rejected': 'bg-danger'
                    };
                    return `<span class="badge ${statusClasses[data.toLowerCase()]}">${data}</span>`;
                }
            },
            {
                targets: 8, // date column
                render: function(data) {
                    return moment(data).format('DD MMM YYYY HH:mm');
                }
            },
            {
                targets: -1, // actions column
                render: function(data, type, row) {
                    let actions = `
                        <div class="btn-group">
                            <button class="btn btn-sm btn-info view-declaration" data-id="${row.id}">
                                <i class="fa fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-primary edit-declaration" data-id="${row.id}">
                                <i class="fa fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-success view-proofs" data-id="${row.id}">
                                <i class="fa fa-file"></i>
                            </button>`;
                    
                    if (row.status.toLowerCase() === 'submitted') {
                        actions += `
                            <button class="btn btn-sm btn-warning verify-declaration" data-id="${row.id}">
                                <i class="fa fa-check"></i>
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
            calculateTotals(this.api());
        }
    });

    // Select all checkbox handler
    $('#select_all_declarations').on('change', function() {
        $('.declaration-checkbox').prop('checked', $(this).prop('checked'));
        updateBulkActionButtons();
    });

    // Individual checkbox handler
    $(document).on('change', '.declaration-checkbox', function() {
        updateBulkActionButtons();
    });

    // Initialize financial year control
    initializeFinancialYearControl();

    // Filter handlers
    $('.declaration-filter').on('change', function() {
        declarationTable.ajax.reload();
    });

    // View Declaration
    $(document).on('click', '.view-declaration', function() {
        const declarationId = $(this).data('id');
        viewDeclaration(declarationId);
    });

    function viewDeclaration(declarationId) {
        $.ajax({
            url: `/api/it-declarations/${declarationId}`,
            method: 'GET',
            success: function(response) {
                showDeclarationModal(response);
            },
            error: function(xhr) {
                showErrorAlert('Error loading declaration');
            }
        });
    }

    function showDeclarationModal(declaration) {
        // Employee Information
        $('#emp_name').text(declaration.employee_name);
        $('#emp_id').text(declaration.employee_id);
        $('#pan_number').text(declaration.pan_number);
        $('#financial_year_display').text(declaration.financial_year);

        // Section 80C Investments
        let section80CHtml = '';
        declaration.section_80c.forEach(item => {
            section80CHtml += `
                <tr>
                    <td>${item.description}</td>
                    <td class="text-end">${formatCurrency(item.declared_amount)}</td>
                    <td class="text-end">${formatCurrency(item.submitted_amount)}</td>
                    <td class="text-end">${item.proof_status}</td>
                </tr>`;
        });
        $('#section_80c_list').html(section80CHtml);
        $('#total_80c').text(formatCurrency(declaration.total_80c));

        // House Rent
        $('#house_rent_details').html(`
            <p><strong>Landlord Name:</strong> ${declaration.house_rent.landlord_name}</p>
            <p><strong>Landlord PAN:</strong> ${declaration.house_rent.landlord_pan}</p>
            <p><strong>Monthly Rent:</strong> ${formatCurrency(declaration.house_rent.monthly_rent)}</p>
            <p><strong>Total HRA Claimed:</strong> ${formatCurrency(declaration.house_rent.total_hra)}</p>
        `);

        // Other Deductions
        let otherDeductionsHtml = '';
        declaration.other_deductions.forEach(item => {
            otherDeductionsHtml += `
                <tr>
                    <td>${item.description}</td>
                    <td class="text-end">${formatCurrency(item.amount)}</td>
                    <td class="text-end">${item.proof_status}</td>
                </tr>`;
        });
        $('#other_deductions_list').html(otherDeductionsHtml);

        $('#declaration_modal').modal('show');
    }

    // Edit Declaration
    $(document).on('click', '.edit-declaration', function() {
        const declarationId = $(this).data('id');
        editDeclaration(declarationId);
    });

    function editDeclaration(declarationId) {
        $.ajax({
            url: `/api/it-declarations/${declarationId}/edit`,
            method: 'GET',
            success: function(response) {
                showEditModal(response);
            },
            error: function(xhr) {
                showErrorAlert('Error loading declaration for edit');
            }
        });
    }

    // View Proofs
    $(document).on('click', '.view-proofs', function() {
        const declarationId = $(this).data('id');
        viewProofs(declarationId);
    });

    function viewProofs(declarationId) {
        $.ajax({
            url: `/api/it-declarations/${declarationId}/proofs`,
            method: 'GET',
            success: function(response) {
                showProofsModal(response);
            },
            error: function(xhr) {
                showErrorAlert('Error loading proofs');
            }
        });
    }

    // Verify Declaration
    $(document).on('click', '.verify-declaration', function() {
        const declarationId = $(this).data('id');
        if (confirm('Are you sure you want to verify this declaration?')) {
            verifyDeclaration(declarationId);
        }
    });

    function verifyDeclaration(declarationId) {
        $.ajax({
            url: `/api/it-declarations/${declarationId}/verify`,
            method: 'POST',
            success: function(response) {
                declarationTable.ajax.reload();
                showSuccessAlert('Declaration verified successfully');
            },
            error: function(xhr) {
                showErrorAlert('Error verifying declaration');
            }
        });
    }

    // Export Declarations
    $('#export_declarations').on('click', function() {
        const format = $('#export_format').val();
        exportDeclarations(format);
    });

    function exportDeclarations(format) {
        const params = {
            financial_year: $('#financial_year').val(),
            department: $('#department_filter').val(),
            status: $('#status_filter').val(),
            format: format
        };

        $.ajax({
            url: '/api/it-declarations/export',
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
                a.download = `it_declarations_${params.financial_year}.${format}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            },
            error: function(xhr) {
                showErrorAlert('Error exporting declarations');
            }
        });
    }

    // Helper Functions
    function getSelectedDeclarations() {
        return $('.declaration-checkbox:checked').map(function() {
            return $(this).val();
        }).get();
    }

    function updateBulkActionButtons() {
        const selectedCount = $('.declaration-checkbox:checked').length;
        $('#bulk_verify, #bulk_export').prop('disabled', selectedCount === 0);
        $('#selected_count').text(selectedCount);
    }

    function calculateTotals(api) {
        const totalDeclared = api
            .column(4)
            .data()
            .reduce((a, b) => parseFloat(b.replace(/[^0-9.-]+/g, '')) + a, 0);
        
        const totalSubmitted = api
            .column(5)
            .data()
            .reduce((a, b) => parseFloat(b.replace(/[^0-9.-]+/g, '')) + a, 0);

        $('#total_declared').text(formatCurrency(totalDeclared));
        $('#total_submitted').text(formatCurrency(totalSubmitted));
    }

    function initializeFinancialYearControl() {
        const currentYear = moment().year();
        for (let i = currentYear - 2; i <= currentYear; i++) {
            const fy = `${i}-${i + 1}`;
            $('#financial_year').append(
                `<option value="${fy}" ${i === currentYear ? 'selected' : ''}>
                    ${fy}
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