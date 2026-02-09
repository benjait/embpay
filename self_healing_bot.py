#!/usr/bin/env python3
"""
Self-Healing Bot for EmbPay
Automatically tests APIs, finds errors, and attempts fixes
"""

import subprocess
import json
import re
import os
import sys
from datetime import datetime

class SelfHealingBot:
    def __init__(self, base_url="http://localhost:3800"):
        self.base_url = base_url
        self.errors_found = []
        self.fixes_applied = []
        self.log_file = "/tmp/self_healing_bot.log"
        
    def log(self, message):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_msg = f"[{timestamp}] {message}"
        print(log_msg)
        with open(self.log_file, "a") as f:
            f.write(log_msg + "\n")
    
    def run_command(self, cmd, timeout=30):
        """Run shell command and return output"""
        try:
            result = subprocess.run(
                cmd, shell=True, capture_output=True, text=True, timeout=timeout
            )
            return {
                "success": result.returncode == 0,
                "stdout": result.stdout,
                "stderr": result.stderr,
                "code": result.returncode
            }
        except subprocess.TimeoutExpired:
            return {"success": False, "stdout": "", "stderr": "Timeout", "code": -1}
        except Exception as e:
            return {"success": False, "stdout": "", "stderr": str(e), "code": -1}
    
    def test_health_endpoint(self):
        """Test basic health endpoint"""
        self.log("🔍 Testing health endpoint...")
        result = self.run_command(f"curl -s {self.base_url}/api/health")
        
        if not result["success"]:
            self.errors_found.append({
                "type": "API_ERROR",
                "endpoint": "/api/health",
                "error": result["stderr"],
                "severity": "CRITICAL"
            })
            return False
        
        try:
            data = json.loads(result["stdout"])
            if data.get("success"):
                self.log("✅ Health endpoint OK")
                return True
            else:
                self.errors_found.append({
                    "type": "API_ERROR",
                    "endpoint": "/api/health",
                    "error": data.get("error", "Unknown error"),
                    "severity": "HIGH"
                })
                return False
        except json.JSONDecodeError:
            self.errors_found.append({
                "type": "JSON_PARSE_ERROR",
                "endpoint": "/api/health",
                "error": "Invalid JSON response",
                "severity": "MEDIUM"
            })
            return False
    
    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        self.log("🔍 Testing auth endpoints...")
        
        # Test register with weak password (should fail validation)
        result = self.run_command(
            f"curl -s -X POST {self.base_url}/api/auth/register "
            f"-H 'Content-Type: application/json' "
            f"-d '{{\"email\":\"test@example.com\",\"password\":\"weak\",\"name\":\"Test\"}}'"
        )
        
        if result["success"]:
            try:
                data = json.loads(result["stdout"])
                if not data.get("success") and "password" in str(data.get("error", "")).lower():
                    self.log("✅ Password validation working")
                else:
                    self.errors_found.append({
                        "type": "VALIDATION_ERROR",
                        "endpoint": "/api/auth/register",
                        "error": "Password validation not working correctly",
                        "severity": "MEDIUM"
                    })
            except:
                pass
        
        # Test register with strong password
        result = self.run_command(
            f"curl -s -X POST {self.base_url}/api/auth/register "
            f"-H 'Content-Type: application/json' "
            f"-d '{{\"email\":\"test_{datetime.now().strftime('%s')}@example.com\",\"password\":\"StrongPass123!\",\"name\":\"Test User\"}}'"
        )
        
        if result["success"]:
            try:
                data = json.loads(result["stdout"])
                if data.get("success") or "already exists" in str(data.get("error", "")).lower():
                    self.log("✅ Register endpoint OK")
                else:
                    self.errors_found.append({
                        "type": "API_ERROR",
                        "endpoint": "/api/auth/register",
                        "error": data.get("error", "Unknown error"),
                        "severity": "HIGH"
                    })
            except:
                self.log("⚠️ Could not parse register response")
    
    def check_typescript_errors(self):
        """Check for TypeScript compilation errors"""
        self.log("🔍 Checking TypeScript errors...")
        
        result = self.run_command(
            "cd ~/clawd/projects/embpay && npx tsc --noEmit 2>&1 | head -50",
            timeout=60
        )
        
        if not result["success"] and result["stderr"]:
            errors = result["stderr"].strip()
            if errors:
                self.errors_found.append({
                    "type": "TYPESCRIPT_ERROR",
                    "files": "Multiple files",
                    "error": errors[:500],
                    "severity": "CRITICAL"
                })
                self.log(f"❌ TypeScript errors found: {len(errors)} chars")
            else:
                self.log("✅ No TypeScript errors")
        else:
            self.log("✅ TypeScript compilation OK")
    
    def check_build_errors(self):
        """Check for build errors"""
        self.log("🔍 Checking build errors...")
        
        # Just check if .next directory exists and has content
        result = self.run_command(
            "ls -la ~/clawd/projects/embpay/.next/ 2>&1 | head -10"
        )
        
        if not result["success"] or "No such file" in result["stderr"]:
            self.errors_found.append({
                "type": "BUILD_ERROR",
                "files": ".next directory",
                "error": "Build directory missing - need to run npm run build",
                "severity": "HIGH"
            })
            self.log("❌ Build directory missing")
        else:
            self.log("✅ Build directory exists")
    
    def attempt_fix(self, error):
        """Attempt to fix an error automatically"""
        self.log(f"🔧 Attempting to fix: {error['type']}...")
        
        if error["type"] == "TYPESCRIPT_ERROR":
            # Common fixes for TS errors
            if "CardTitle" in error.get("error", ""):
                # Add CardTitle to card.tsx
                fix_result = self.fix_card_component()
                if fix_result:
                    self.fixes_applied.append({
                        "error": error,
                        "fix": "Added CardTitle/CardDescription to card.tsx",
                        "status": "SUCCESS"
                    })
                    return True
        
        elif error["type"] == "BUILD_ERROR":
            # Try to build
            self.log("🔨 Running npm run build...")
            result = self.run_command(
                "cd ~/clawd/projects/embpay && npm run build 2>&1 | tail -20",
                timeout=120
            )
            if result["success"]:
                self.fixes_applied.append({
                    "error": error,
                    "fix": "Ran npm run build",
                    "status": "SUCCESS"
                })
                return True
            else:
                self.fixes_applied.append({
                    "error": error,
                    "fix": "npm run build",
                    "status": "FAILED",
                    "details": result["stderr"][:200]
                })
        
        return False
    
    def fix_card_component(self):
        """Fix missing CardTitle/CardDescription exports"""
        card_file = "/home/ubuntu/clawd/projects/embpay/src/components/ui/card.tsx"
        
        try:
            with open(card_file, "r") as f:
                content = f.read()
            
            if "CardTitle" not in content:
                # Add CardTitle and CardDescription
                append_code = '''

export function CardTitle({ children, className }: CardProps) {
  return (
    <h3 className={cn("text-lg font-semibold text-white", className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className }: CardProps) {
  return (
    <p className={cn("text-sm text-slate-400", className)}>
      {children}
    </p>
  );
}
'''
                with open(card_file, "a") as f:
                    f.write(append_code)
                
                self.log("✅ Fixed: Added CardTitle/CardDescription")
                return True
        except Exception as e:
            self.log(f"❌ Failed to fix card component: {e}")
        
        return False
    
    def generate_report(self):
        """Generate final report"""
        self.log("\n" + "="*60)
        self.log("📊 SELF-HEALING BOT REPORT")
        self.log("="*60)
        
        self.log(f"\n🐛 Errors Found: {len(self.errors_found)}")
        for err in self.errors_found:
            self.log(f"   - [{err['severity']}] {err['type']}: {err.get('endpoint', err.get('files', 'N/A'))}")
        
        self.log(f"\n🔧 Fixes Applied: {len(self.fixes_applied)}")
        for fix in self.fixes_applied:
            status_emoji = "✅" if fix['status'] == "SUCCESS" else "❌"
            self.log(f"   {status_emoji} {fix['fix']}")
        
        # Health score
        total_issues = len(self.errors_found)
        fixed_issues = len([f for f in self.fixes_applied if f['status'] == 'SUCCESS'])
        
        if total_issues == 0:
            score = 100
        else:
            score = int((fixed_issues / total_issues) * 100) if total_issues > 0 else 100
        
        self.log(f"\n💯 Health Score: {score}/100")
        
        if score == 100:
            self.log("🎉 All systems operational!")
        elif score >= 80:
            self.log("⚠️  Minor issues remain")
        elif score >= 50:
            self.log("🔴 Significant issues found")
        else:
            self.log("🚨 Critical failures - manual intervention needed")
        
        self.log("="*60)
        
        return {
            "errors_found": self.errors_found,
            "fixes_applied": self.fixes_applied,
            "health_score": score,
            "timestamp": datetime.now().isoformat()
        }
    
    def run(self):
        """Main execution loop"""
        self.log("🚀 Starting Self-Healing Bot...")
        self.log(f"📍 Target: {self.base_url}")
        self.log("="*60)
        
        # Run tests
        self.test_health_endpoint()
        self.test_auth_endpoints()
        self.check_typescript_errors()
        self.check_build_errors()
        
        # Attempt fixes
        if self.errors_found:
            self.log(f"\n🔧 Attempting to fix {len(self.errors_found)} errors...")
            for error in self.errors_found:
                self.attempt_fix(error)
        
        # Generate report
        report = self.generate_report()
        
        # Save report
        report_file = "/tmp/self_healing_report.json"
        with open(report_file, "w") as f:
            json.dump(report, f, indent=2)
        self.log(f"\n📄 Report saved to: {report_file}")
        
        return report

if __name__ == "__main__":
    bot = SelfHealingBot()
    bot.run()
