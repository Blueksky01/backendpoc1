import { Injectable } from '@nestjs/common';
import type {
  ApiCatalogGroup,
  ApiCatalogResponse,
  ApiEndpointItem,
} from './interfaces/api-endpoint.interface.js';

@Injectable()
export class DocsService {
  private readonly endpoints: ApiEndpointItem[] = [
    // Mobile Endpoints
    {
      id: 'mobile-dashboard',
      method: 'GET',
      path: '/mobile/dashboard',
      category: 'Mobile',
      title: 'Mobile Home Dashboard (BFF)',
      description:
        'ดึงภาพรวมสถิติพนักงานทั้งหมด, การกระจายตามแผนก, และรายชื่อพนักงานล่าสุดในครั้งเดียวเพื่อลด Network Latency บนมือถือ',
      authRequired: false,
      responseExample: {
        success: true,
        data: {
          summary: {
            totalEmployees: 50,
            activeEmployees: 48,
            inactiveEmployees: 2,
            departmentCount: 5,
          },
          departments: [{ name: 'Engineering', count: 14 }],
          recentEmployees: [],
        },
      },
      sampleCurl: 'curl http://localhost:3000/mobile/dashboard',
    },
    {
      id: 'mobile-employees',
      method: 'GET',
      path: '/mobile/employees',
      category: 'Mobile',
      title: 'Mobile Employee List (Infinite Scroll)',
      description:
        'ดึงรายชื่อพนักงานพร้อมข้อมูล Card (avatar, initials, shortAddress) และสถานะ pagination (hasNextPage, nextPage) สำหรับ Infinite Scroll',
      authRequired: false,
      queryParams: [
        { name: 'page', type: 'number', required: false, description: 'หมายเลขหน้า (เริ่มต้น 1)', example: 1 },
        { name: 'limit', type: 'number', required: false, description: 'จำนวนรายการต่อหน้า (เริ่มต้น 10)', example: 10 },
        { name: 'search', type: 'string', required: false, description: 'คำค้นหา (ชื่อ, อีเมล, แผนก, รหัส)', example: 'สมชาย' },
        { name: 'department', type: 'string', required: false, description: 'กรองตามแผนก', example: 'Engineering' },
        { name: 'status', type: 'string', required: false, description: 'กรองตามสถานะ (Active, Inactive, On Leave)', example: 'Active' },
      ],
      sampleCurl: 'curl "http://localhost:3000/mobile/employees?page=1&limit=10"',
    },
    {
      id: 'mobile-employee-detail',
      method: 'GET',
      path: '/mobile/employees/:id',
      category: 'Mobile',
      title: 'Mobile Employee Detail',
      description:
        'ดึงข้อมูลรายละเอียดพนักงาน พร้อมที่อยู่ที่จัดรูปแบบเรียบร้อย (fullAddress) และ action links (mailtoUrl, mapQuery) สำหรับ Native App',
      authRequired: false,
      pathParams: [
        { name: 'id', type: 'string', required: true, description: 'รหัสพนักงาน เช่น EMP-31433', example: 'EMP-31433' },
      ],
      sampleCurl: 'curl http://localhost:3000/mobile/employees/EMP-31433',
    },
    {
      id: 'mobile-filters',
      method: 'GET',
      path: '/mobile/filters',
      category: 'Mobile',
      title: 'Mobile Filter Options',
      description:
        'ดึงรายชื่อแผนกและสถานะทั้งหมดที่มีอยู่ในระบบ เพื่อนำไปสร้าง Filter Chips / Dropdown ในแอพมือถือ',
      authRequired: false,
      sampleCurl: 'curl http://localhost:3000/mobile/filters',
    },
    {
      id: 'mobile-search',
      method: 'GET',
      path: '/mobile/search',
      category: 'Mobile',
      title: 'Mobile Instant Search Suggestions',
      description:
        'ค้นหาด่วนแบบ Lightweight สำหรับช่องค้นหา Search Bar (คืนค่าผลลัพธ์ย่อสำหรับ autocomplete)',
      authRequired: false,
      queryParams: [
        { name: 'q', type: 'string', required: false, description: 'คำค้นหา', example: 'สม' },
        { name: 'limit', type: 'number', required: false, description: 'จำนวนคำแนะนำสูงสุด (ค่าเริ่มต้น 8)', example: 8 },
      ],
      sampleCurl: 'curl "http://localhost:3000/mobile/search?q=สม&limit=5"',
    },
    {
      id: 'mobile-update-status',
      method: 'PATCH',
      path: '/mobile/employees/:id/status',
      category: 'Mobile',
      title: 'Quick Status Toggle',
      description:
        'เปลี่ยนสถานะพนักงานอย่างรวดเร็ว (Active, Inactive, On Leave) จาก Action Sheet หรือ Switch บนมือถือ',
      authRequired: false,
      pathParams: [
        { name: 'id', type: 'string', required: true, description: 'รหัสพนักงาน', example: 'EMP-31433' },
      ],
      requestBody: { status: 'Inactive' },
      sampleCurl: `curl -X PATCH http://localhost:3000/mobile/employees/EMP-31433/status -H "Content-Type: application/json" -d '{"status":"Inactive"}'`,
    },

    // Employees Management Endpoints
    {
      id: 'employees-list',
      method: 'GET',
      path: '/employees',
      category: 'Employees',
      title: 'List All Employees (Web / Admin)',
      description: 'ดึงรายชื่อพนักงานทั้งหมด หรือระบุ query parameters เพื่อแบ่งหน้าและค้นหา',
      authRequired: false,
      queryParams: [
        { name: 'page', type: 'number', required: false, description: 'หมายเลขหน้า', example: 1 },
        { name: 'limit', type: 'number', required: false, description: 'จำนวนต่อหน้า', example: 10 },
        { name: 'search', type: 'string', required: false, description: 'คำค้นหา', example: 'Engineering' },
        { name: 'department', type: 'string', required: false, description: 'กรองตามแผนก', example: 'Engineering' },
        { name: 'status', type: 'string', required: false, description: 'กรองตามสถานะ', example: 'Active' },
      ],
      sampleCurl: 'curl http://localhost:3000/employees',
    },
    {
      id: 'employees-get-one',
      method: 'GET',
      path: '/employees/:id',
      category: 'Employees',
      title: 'Get Employee by ID',
      description: 'ดึงข้อมูลพนักงานรายบุคคลด้วยรหัสประจำตัวพนักงาน',
      authRequired: false,
      pathParams: [
        { name: 'id', type: 'string', required: true, description: 'รหัสพนักงาน', example: 'EMP-31433' },
      ],
      sampleCurl: 'curl http://localhost:3000/employees/EMP-31433',
    },
    {
      id: 'employees-create',
      method: 'POST',
      path: '/employees',
      category: 'Employees',
      title: 'Create Employee',
      description: 'เพิ่มข้อมูลพนักงานใหม่เข้าสู่ระบบ',
      authRequired: false,
      requestBody: {
        name: 'กิตติศักดิ์ พัฒนา',
        email: 'kittisak.pat@example.com',
        department: 'Engineering',
        status: 'Active',
        address: {
          street: '123/45 ถนนสุขุมวิท',
          subdistrict: 'คลองเตย',
          district: 'คลองเตย',
          province: 'กรุงเทพมหานคร',
          postalCode: '10110',
        },
      },
      sampleCurl: `curl -X POST http://localhost:3000/employees -H "Content-Type: application/json" -d '{"name":"กิตติศักดิ์ พัฒนา","email":"kittisak.pat@example.com","department":"Engineering","status":"Active"}'`,
    },
    {
      id: 'employees-update-put',
      method: 'PUT',
      path: '/employees/:id',
      category: 'Employees',
      title: 'Update Employee (Full)',
      description: 'แก้ไขข้อมูลพนักงานแบบเต็มรูปแบบ',
      authRequired: false,
      pathParams: [
        { name: 'id', type: 'string', required: true, description: 'รหัสพนักงาน', example: 'EMP-31433' },
      ],
      requestBody: {
        name: 'สมชาย ศรีเจริญสุข',
        email: 'somchai.sri@example.com',
        department: 'Engineering',
        status: 'Active',
      },
      sampleCurl: `curl -X PUT http://localhost:3000/employees/EMP-31433 -H "Content-Type: application/json" -d '{"name":"สมชาย ศรีเจริญสุข"}'`,
    },
    {
      id: 'employees-update-patch',
      method: 'PATCH',
      path: '/employees/:id',
      category: 'Employees',
      title: 'Update Employee (Partial)',
      description: 'แก้ไขข้อมูลพนักงานเฉพาะฟิลด์ที่ส่งมา',
      authRequired: false,
      pathParams: [
        { name: 'id', type: 'string', required: true, description: 'รหัสพนักงาน', example: 'EMP-31433' },
      ],
      requestBody: {
        department: 'Product',
      },
      sampleCurl: `curl -X PATCH http://localhost:3000/employees/EMP-31433 -H "Content-Type: application/json" -d '{"department":"Product"}'`,
    },
    {
      id: 'employees-delete',
      method: 'DELETE',
      path: '/employees/:id',
      category: 'Employees',
      title: 'Delete Employee',
      description: 'ลบข้อมูลพนักงานออกจากระบบ',
      authRequired: false,
      pathParams: [
        { name: 'id', type: 'string', required: true, description: 'รหัสพนักงาน', example: 'EMP-31433' },
      ],
      sampleCurl: 'curl -X DELETE http://localhost:3000/employees/EMP-31433',
    },

    // Auth Endpoints
    {
      id: 'auth-login',
      method: 'POST',
      path: '/auth/login',
      category: 'Auth',
      title: 'Admin Login',
      description: 'เข้าสู่ระบบด้วยชื่อผู้ใช้และรหัสผ่านเพื่อรับ Access Token และ Refresh Token',
      authRequired: false,
      requestBody: {
        username: 'admin',
        password: 'admin1234',
      },
      sampleCurl: `curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"admin1234"}'`,
    },
    {
      id: 'auth-refresh',
      method: 'POST',
      path: '/auth/refresh',
      category: 'Auth',
      title: 'Refresh Token',
      description: 'ใช้ Refresh Token เพื่อขอรับ Access Token ชุดใหม่เมื่อ Token เดิมหมดอายุ',
      authRequired: false,
      requestBody: {
        refreshToken: '<YOUR_REFRESH_TOKEN>',
      },
      sampleCurl: `curl -X POST http://localhost:3000/auth/refresh -H "Content-Type: application/json" -d '{"refreshToken":"YOUR_TOKEN"}'`,
    },
    {
      id: 'auth-profile',
      method: 'GET',
      path: '/auth/profile',
      category: 'Auth',
      title: 'Get Admin Profile',
      description: 'ดูข้อมูลโปรไฟล์ของผู้ดูแลระบบที่กำลังล็อกอินอยู่ (ต้องแนบ Bearer Token)',
      authRequired: true,
      sampleCurl: `curl http://localhost:3000/auth/profile -H "Authorization: Bearer <ACCESS_TOKEN>"`,
    },
    {
      id: 'auth-logout',
      method: 'POST',
      path: '/auth/logout',
      category: 'Auth',
      title: 'Logout Admin Session',
      description: 'ออกจากระบบและยกเลิก Refresh Token ในฐานข้อมูล (ต้องแนบ Bearer Token)',
      authRequired: true,
      sampleCurl: `curl -X POST http://localhost:3000/auth/logout -H "Authorization: Bearer <ACCESS_TOKEN>"`,
    },
  ];

  getCatalog(): ApiCatalogResponse {
    const categoryIcons: Record<string, string> = {
      Mobile: '📱',
      Employees: '👥',
      Auth: '🔐',
      System: '⚙️',
    };

    const categoryDescriptions: Record<string, string> = {
      Mobile: 'Endpoints ที่ปรับแต่งสำหรับ Mobile Applications โดยเฉพาะ (BFF, Infinite Scroll, Card View)',
      Employees: 'Endpoints จัดการข้อมูลพนักงานและที่อยู่แบบ CRUD พื้นฐาน',
      Auth: 'ระบบยืนยันตัวตน JWT Authentication, Refresh Token และ Profile Management',
      System: 'ระบบโครงสร้างพื้นฐานและการตรวจสอบสถานะ',
    };

    const categories = ['Mobile', 'Employees', 'Auth'];
    const groups: ApiCatalogGroup[] = categories.map((category) => {
      return {
        category,
        icon: categoryIcons[category] || '📦',
        description: categoryDescriptions[category] || '',
        endpoints: this.endpoints.filter((e) => e.category === category),
      };
    });

    return {
      info: {
        title: 'Project POC API Hub & Documentation',
        description: 'ศูนย์รวม API Endpoints สำหรับ Mobile, Web และ Admin System',
        version: '1.0.0',
        baseUrl: 'http://localhost:3000',
      },
      totalEndpoints: this.endpoints.length,
      categories,
      groups,
    };
  }

  getHtmlPage(): string {
    const catalog = this.getCatalog();
    const catalogJson = JSON.stringify(catalog);

    return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Hub & Endpoints Center</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Prompt:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-main: #0b0f19;
      --bg-card: #111827;
      --bg-card-hover: #1f2937;
      --border-color: #374151;
      --text-main: #f9fafb;
      --text-muted: #9ca3af;
      --primary: #3b82f6;
      --primary-hover: #2563eb;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
      --purple: #a855f7;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Prompt', 'Plus Jakarta Sans', -apple-system, sans-serif;
      background-color: var(--bg-main);
      color: var(--text-main);
      line-height: 1.6;
      padding-bottom: 60px;
    }

    code, pre {
      font-family: 'JetBrains Mono', monospace;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px 20px;
    }

    /* Header */
    header {
      background: linear-gradient(180deg, rgba(31, 41, 55, 0.7) 0%, rgba(11, 15, 25, 0) 100%);
      border-bottom: 1px solid rgba(55, 65, 81, 0.5);
      padding: 40px 0 30px;
      margin-bottom: 24px;
    }

    .header-content {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
    }

    .title-area h1 {
      font-size: 28px;
      font-weight: 700;
      background: linear-gradient(90deg, #60a5fa, #a78bfa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .title-area p {
      color: var(--text-muted);
      margin-top: 6px;
      font-size: 15px;
    }

    .badge-count {
      display: inline-block;
      background: rgba(59, 130, 246, 0.2);
      color: #93c5fd;
      border: 1px solid rgba(59, 130, 246, 0.4);
      padding: 3px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
    }

    /* Auth & Controls */
    .controls-panel {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 18px 20px;
      margin-bottom: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .token-input-group {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .token-input-group label {
      font-size: 13px;
      font-weight: 600;
      color: #d1d5db;
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .token-input-group input {
      flex: 1;
      min-width: 250px;
      background: #1f2937;
      border: 1px solid #4b5563;
      color: #fff;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 13px;
    }

    .token-input-group input:focus {
      outline: none;
      border-color: var(--primary);
    }

    .filter-bar {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .search-box {
      flex: 1;
      min-width: 240px;
      position: relative;
    }

    .search-box input {
      width: 100%;
      background: #1f2937;
      border: 1px solid #4b5563;
      color: #fff;
      padding: 10px 14px 10px 38px;
      border-radius: 8px;
      font-size: 14px;
    }

    .search-box input:focus {
      outline: none;
      border-color: var(--primary);
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
    }

    .pills {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .pill-btn {
      background: #1f2937;
      border: 1px solid #4b5563;
      color: var(--text-muted);
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .pill-btn:hover {
      background: #374151;
      color: #fff;
    }

    .pill-btn.active {
      background: var(--primary);
      border-color: var(--primary);
      color: #fff;
    }

    /* Category Group */
    .group-section {
      margin-bottom: 36px;
    }

    .group-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 14px;
      padding-bottom: 8px;
      border-bottom: 2px solid #1f2937;
    }

    .group-header h2 {
      font-size: 20px;
      font-weight: 700;
      color: #f3f4f6;
    }

    .group-header p {
      font-size: 13px;
      color: var(--text-muted);
      margin-left: 8px;
    }

    /* Endpoint Card */
    .endpoint-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      margin-bottom: 12px;
      overflow: hidden;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .endpoint-card:hover {
      border-color: #4b5563;
      box-shadow: 0 4px 14px rgba(0,0,0,0.25);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 18px;
      cursor: pointer;
      user-select: none;
      background: rgba(31, 41, 55, 0.4);
    }

    .method-badge {
      font-size: 11px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      min-width: 65px;
      text-align: center;
    }

    .method-GET { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); }
    .method-POST { background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.4); }
    .method-PUT { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); }
    .method-PATCH { background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4); }
    .method-DELETE { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); }

    .path-text {
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      font-weight: 600;
      color: #e5e7eb;
    }

    .title-text {
      color: var(--text-muted);
      font-size: 13px;
      margin-left: auto;
      text-align: right;
    }

    .auth-badge {
      font-size: 11px;
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      padding: 2px 8px;
      border-radius: 4px;
      margin-left: 8px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .chevron {
      color: var(--text-muted);
      transition: transform 0.2s;
    }

    .endpoint-card.open .chevron {
      transform: rotate(180deg);
    }

    /* Card Details Body */
    .card-body {
      display: none;
      padding: 18px 20px;
      border-top: 1px solid var(--border-color);
      background: #0f172a;
    }

    .endpoint-card.open .card-body {
      display: block;
    }

    .desc-text {
      font-size: 14px;
      color: #cbd5e1;
      margin-bottom: 16px;
    }

    .section-title {
      font-size: 12px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 14px;
      margin-bottom: 8px;
    }

    .table-params {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
      font-size: 13px;
    }

    .table-params th, .table-params td {
      border: 1px solid #334155;
      padding: 6px 10px;
      text-align: left;
    }

    .table-params th {
      background: #1e293b;
      color: #94a3b8;
      font-weight: 600;
    }

    .code-box {
      background: #090d16;
      border: 1px solid #1e293b;
      border-radius: 8px;
      padding: 12px;
      font-size: 13px;
      color: #38bdf8;
      overflow-x: auto;
      position: relative;
    }

    .actions-row {
      display: flex;
      gap: 10px;
      margin-top: 16px;
      flex-wrap: wrap;
    }

    .btn {
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s;
    }

    .btn-primary {
      background: var(--primary);
      color: #fff;
    }

    .btn-primary:hover {
      background: var(--primary-hover);
    }

    .btn-outline {
      background: #1e293b;
      border: 1px solid #475569;
      color: #cbd5e1;
    }

    .btn-outline:hover {
      background: #334155;
      color: #fff;
    }

    /* Live Tester Output */
    .tester-panel {
      margin-top: 16px;
      background: #020617;
      border: 1px solid #1e293b;
      border-radius: 8px;
      padding: 14px;
      display: none;
    }

    .tester-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 12px;
    }

    .status-tag {
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
    }

    .status-200, .status-201 { background: rgba(16, 185, 129, 0.2); color: #34d399; }
    .status-400, .status-401, .status-404, .status-500 { background: rgba(239, 68, 68, 0.2); color: #f87171; }

    /* Toast */
    #toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #10b981;
      color: #000;
      padding: 10px 18px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 13px;
      display: none;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      z-index: 1000;
    }
  </style>
</head>
<body>
  <header>
    <div class="container header-content">
      <div class="title-area">
        <h1>🌐 API Hub & Endpoints Center</h1>
        <p>ศูนย์รวม API Endpoints สำหรับ Mobile, Web และ Admin System ค้นหาและทดสอบได้ทันที</p>
      </div>
      <div>
        <span class="badge-count" id="totalCountBadge">${catalog.totalEndpoints} Endpoints Available</span>
        <a href="/api/catalog" target="_blank" class="btn btn-outline" style="margin-left: 8px; text-decoration: none;">📄 JSON Spec</a>
      </div>
    </div>
  </header>

  <main class="container">
    <!-- Controls Panel -->
    <div class="controls-panel">
      <!-- JWT Token Setup -->
      <div class="token-input-group">
        <label>🔑 Bearer Token (สำหรับ Auth APIs):</label>
        <input type="text" id="globalBearerToken" placeholder="วาง Access Token ที่ได้จาก /auth/login ที่นี่...">
        <button class="btn btn-outline" onclick="saveToken()">บันทึก Token</button>
      </div>

      <!-- Search & Filters -->
      <div class="filter-bar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input type="text" id="searchInput" placeholder="ค้นหา Endpoint เช่น /mobile, dashboard, employees, status..." oninput="handleSearch()">
        </div>
        <div class="pills">
          <button class="pill-btn active" data-cat="all" onclick="filterCategory('all', this)">ทั้งหมด (All)</button>
          <button class="pill-btn" data-cat="Mobile" onclick="filterCategory('Mobile', this)">📱 Mobile</button>
          <button class="pill-btn" data-cat="Employees" onclick="filterCategory('Employees', this)">👥 Employees</button>
          <button class="pill-btn" data-cat="Auth" onclick="filterCategory('Auth', this)">🔐 Auth</button>
        </div>
      </div>
    </div>

    <!-- Groups Container -->
    <div id="groupsContainer"></div>
  </main>

  <div id="toast">Copied to clipboard!</div>

  <script>
    const CATALOG = ${catalogJson};
    let currentCategory = 'all';

    function init() {
      const savedToken = localStorage.getItem('api_bearer_token');
      if (savedToken) {
        document.getElementById('globalBearerToken').value = savedToken;
      }
      renderGroups(CATALOG.groups);
    }

    function saveToken() {
      const val = document.getElementById('globalBearerToken').value.trim();
      localStorage.setItem('api_bearer_token', val);
      showToast('บันทึก Token เรียบร้อยแล้ว!');
    }

    function renderGroups(groups) {
      const container = document.getElementById('groupsContainer');
      container.innerHTML = '';

      let visibleEndpoints = 0;

      groups.forEach(group => {
        if (currentCategory !== 'all' && group.category !== currentCategory) {
          return;
        }

        const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
        const matchedEndpoints = group.endpoints.filter(ep => {
          if (!searchTerm) return true;
          return ep.path.toLowerCase().includes(searchTerm) ||
                 ep.title.toLowerCase().includes(searchTerm) ||
                 ep.description.toLowerCase().includes(searchTerm) ||
                 ep.method.toLowerCase().includes(searchTerm);
        });

        if (matchedEndpoints.length === 0) return;

        visibleEndpoints += matchedEndpoints.length;

        const section = document.createElement('div');
        section.className = 'group-section';

        section.innerHTML = \`
          <div class="group-header">
            <h2>\${group.icon} \${group.category} Endpoints</h2>
            <p>\${group.description}</p>
          </div>
        \`;

        matchedEndpoints.forEach(ep => {
          const card = createEndpointCard(ep);
          section.appendChild(card);
        });

        container.appendChild(section);
      });

      document.getElementById('totalCountBadge').textContent = \`\${visibleEndpoints} Endpoints\`;
    }

    function createEndpointCard(ep) {
      const card = document.createElement('div');
      card.className = 'endpoint-card';
      card.id = \`card-\${ep.id}\`;

      const authTag = ep.authRequired
        ? '<span class="auth-badge">🔒 Auth Required</span>'
        : '';

      let queryParamsHtml = '';
      if (ep.queryParams && ep.queryParams.length > 0) {
        queryParamsHtml = \`
          <div class="section-title">Query Parameters</div>
          <table class="table-params">
            <thead>
              <tr><th>Param</th><th>Type</th><th>Required</th><th>Description</th></tr>
            </thead>
            <tbody>
              \${ep.queryParams.map(p => \`
                <tr>
                  <td><code>\${p.name}</code></td>
                  <td>\${p.type}</td>
                  <td>\${p.required ? 'Yes' : 'No'}</td>
                  <td>\${p.description} \${p.example ? \`(เช่น: <code>\${p.example}</code>)\` : ''}</td>
                </tr>
              \`).join('')}
            </tbody>
          </table>
        \`;
      }

      let bodyHtml = '';
      if (ep.requestBody) {
        bodyHtml = \`
          <div class="section-title">Request Body (JSON)</div>
          <pre class="code-box"><code>\${JSON.stringify(ep.requestBody, null, 2)}</code></pre>
        \`;
      }

      card.innerHTML = \`
        <div class="card-header" onclick="toggleCard('\${ep.id}')">
          <span class="method-badge method-\${ep.method}">\${ep.method}</span>
          <span class="path-text">\${ep.path}</span>
          \${authTag}
          <span class="title-text">\${ep.title}</span>
          <span class="chevron">▼</span>
        </div>
        <div class="card-body">
          <div class="desc-text">\${ep.description}</div>
          \${queryParamsHtml}
          \${bodyHtml}
          <div class="section-title">Sample cURL</div>
          <pre class="code-box"><code>\${ep.sampleCurl}</code></pre>

          <div class="actions-row">
            <button class="btn btn-primary" onclick="testEndpoint('\${ep.id}')">⚡ Test Request (Try it out)</button>
            <button class="btn btn-outline" onclick="copyCurl('\${ep.sampleCurl.replace(/'/g, "\\\\'")}')">📋 Copy cURL</button>
          </div>

          <!-- Live Output Container -->
          <div class="tester-panel" id="tester-\${ep.id}">
            <div class="tester-header">
              <span id="tester-status-\${ep.id}">Response</span>
              <span id="tester-time-\${ep.id}" style="color: #94a3b8;"></span>
            </div>
            <pre class="code-box" style="max-height: 250px; overflow-y: auto;"><code id="tester-output-\${ep.id}">Loading...</code></pre>
          </div>
        </div>
      \`;

      return card;
    }

    function toggleCard(id) {
      const card = document.getElementById(\`card-\${id}\`);
      card.classList.toggle('open');
    }

    function filterCategory(cat, btn) {
      currentCategory = cat;
      document.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderGroups(CATALOG.groups);
    }

    function handleSearch() {
      renderGroups(CATALOG.groups);
    }

    async function testEndpoint(id) {
      const ep = CATALOG.groups.flatMap(g => g.endpoints).find(e => e.id === id);
      if (!ep) return;

      const panel = document.getElementById(\`tester-\${id}\`);
      const statusTag = document.getElementById(\`tester-status-\${id}\`);
      const timeTag = document.getElementById(\`tester-time-\${id}\`);
      const output = document.getElementById(\`tester-output-\${id}\`);

      panel.style.display = 'block';
      output.textContent = 'Sending request...';

      let url = ep.path;
      if (ep.pathParams) {
        ep.pathParams.forEach(p => {
          url = url.replace(\`:\${p.name}\`, p.example || '1');
        });
      }

      if (ep.queryParams) {
        const qParts = [];
        ep.queryParams.forEach(p => {
          if (p.example !== undefined) {
            qParts.push(\`\${p.name}=\${encodeURIComponent(p.example)}\`);
          }
        });
        if (qParts.length > 0) {
          url += '?' + qParts.join('&');
        }
      }

      const headers = { 'Content-Type': 'application/json' };
      const token = document.getElementById('globalBearerToken').value.trim();
      if (token) {
        headers['Authorization'] = \`Bearer \${token}\`;
      }

      const options = {
        method: ep.method,
        headers,
      };

      if (ep.requestBody && ep.method !== 'GET') {
        options.body = JSON.stringify(ep.requestBody);
      }

      const startTime = performance.now();
      try {
        const res = await fetch(url, options);
        const elapsed = Math.round(performance.now() - startTime);

        let data;
        const text = await res.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }

        statusTag.innerHTML = \`<span class="status-tag status-\${res.status}">\${res.status} \${res.statusText}</span>\`;
        timeTag.textContent = \`\${elapsed} ms\`;
        output.textContent = typeof data === 'object' ? JSON.stringify(data, null, 2) : data;

        // Auto-save token if it was /auth/login
        if (id === 'auth-login' && data && data.accessToken) {
          document.getElementById('globalBearerToken').value = data.accessToken;
          localStorage.setItem('api_bearer_token', data.accessToken);
          showToast('✅ Auto-saved JWT Access Token!');
        }
      } catch (err) {
        statusTag.innerHTML = \`<span class="status-tag status-500">Error</span>\`;
        output.textContent = 'Fetch failed: ' + err.message;
      }
    }

    function copyCurl(cmd) {
      navigator.clipboard.writeText(cmd);
      showToast('คัดลอกคำสั่ง cURL เรียบร้อยแล้ว!');
    }

    function showToast(msg) {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.style.display = 'block';
      setTimeout(() => { t.style.display = 'none'; }, 2500);
    }

    window.onload = init;
  </script>
</body>
</html>`;
  }
}
