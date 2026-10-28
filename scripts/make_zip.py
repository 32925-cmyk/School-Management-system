#!/usr/bin/env python3
import os
import zipfile
import tarfile
import time

def create_project_archives():
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    public_dir = os.path.join(project_root, 'public')
    os.makedirs(public_dir, exist_ok=True)
    zip_path = os.path.join(public_dir, 'aurelian-heights-academy.zip')
    tar_path = os.path.join(public_dir, 'aurelian-heights-academy.tar.gz')

    ignored_dirs = {
        'node_modules',
        '.git',
        'dist',
        '.cache',
        '.vscode',
        '__pycache__'
    }

    ignored_extensions = {
        '.zip',
        '.tar.gz',
        '.tgz',
        '.log'
    }

    archive_prefix = 'aurelian-heights-academy'

    print(f"Creating Windows-compatible ZIP at: {zip_path}")
    created_dirs = set()
    file_count = 0

    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        # Create root folder entry
        root_info = zipfile.ZipInfo(f"{archive_prefix}/")
        root_info.date_time = time.localtime(time.time())[:6]
        root_info.external_attr = 0o755 << 16 | 0x10  # directory attribute for Windows & Linux
        zf.writestr(root_info, '')
        created_dirs.add(archive_prefix)

        for root, dirs, files in os.walk(project_root):
            dirs[:] = [d for d in dirs if d not in ignored_dirs and not d.startswith('.git')]

            rel_root = os.path.relpath(root, project_root)
            if rel_root == '.':
                rel_root = ''

            # Create directory entries in the zip with DOS/Windows directory attributes
            if rel_root:
                parts = rel_root.split(os.sep)
                current_dir = archive_prefix
                for part in parts:
                    current_dir = f"{current_dir}/{part}"
                    if current_dir not in created_dirs:
                        d_info = zipfile.ZipInfo(f"{current_dir}/")
                        d_info.date_time = time.localtime(time.time())[:6]
                        d_info.external_attr = 0o755 << 16 | 0x10
                        zf.writestr(d_info, '')
                        created_dirs.add(current_dir)

            for file in files:
                ext = os.path.splitext(file)[1]
                if ext in ignored_extensions:
                    continue
                if file.startswith('.DS_Store'):
                    continue

                full_path = os.path.join(root, file)
                rel_file_path = os.path.relpath(full_path, project_root).replace('\\', '/')

                # Skip the zip/tar themselves inside public
                if rel_file_path in [
                    'public/aurelian-heights-academy.zip',
                    'public/aurelian-heights-academy.tar.gz'
                ]:
                    continue

                archive_rel_path = f"{archive_prefix}/{rel_file_path}"
                
                # Read file data
                with open(full_path, 'rb') as f:
                    data = f.read()

                f_info = zipfile.ZipInfo(archive_rel_path)
                f_info.date_time = time.localtime(os.path.getmtime(full_path))[:6]
                f_info.compress_type = zipfile.ZIP_DEFLATED
                f_info.external_attr = 0o644 << 16 | 0x20  # standard file attribute
                zf.writestr(f_info, data)
                file_count += 1

    zip_size_kb = os.path.getsize(zip_path) / 1024
    print(f"Successfully archived {file_count} files into {zip_path} ({zip_size_kb:.1f} KB)")

    # Also generate .tar.gz
    print(f"Creating TAR.GZ at: {tar_path}")
    with tarfile.open(tar_path, 'w:gz') as tar:
        for root, dirs, files in os.walk(project_root):
            dirs[:] = [d for d in dirs if d not in ignored_dirs and not d.startswith('.git')]
            for file in files:
                ext = os.path.splitext(file)[1]
                if ext in ignored_extensions or file.startswith('.DS_Store'):
                    continue
                full_path = os.path.join(root, file)
                rel_file = os.path.relpath(full_path, project_root)
                if rel_file.startswith('public/aurelian-heights-academy'):
                    continue
                tar.add(full_path, arcname=os.path.join(archive_prefix, rel_file))

    tar_size_kb = os.path.getsize(tar_path) / 1024
    print(f"Successfully created tar.gz ({tar_size_kb:.1f} KB)")

if __name__ == '__main__':
    create_project_archives()
