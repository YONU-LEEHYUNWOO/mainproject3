import os
import subprocess
import sys

def kill_port_8000():
    try:
        # 1. 8000번 포트를 사용하는 프로세스 찾기
        print("🔍 8000번 포트 점유 프로세스 확인 중...")
        output = subprocess.check_output("netstat -ano | findstr :8000", shell=True).decode()
        
        lines = output.strip().split('\n')
        pids = set()
        
        for line in lines:
            if "LISTENING" in line:
                parts = line.split()
                pid = parts[-1]
                if pid != "0": # 시스템 유휴 프로세스 제외
                    pids.add(pid)
        
        if not pids:
            print("✅ 8000번 포트는 현재 비워져 있습니다.")
            return

        # 2. 프로세스 종료
        for pid in pids:
            print(f"🔫 PID {pid} 프로세스 종료 시도...")
            os.system(f"taskkill /F /PID {pid}")
            print(f"✅ PID {pid} 종료 완료")
            
    except subprocess.CalledProcessError:
        print("✅ 8000번 포트를 사용하는 프로세스가 없습니다.")
    except Exception as e:
        print(f"❌ 오류 발생: {e}")

if __name__ == "__main__":
    kill_port_8000()
