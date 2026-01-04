import unittest
import tempfile
import shutil
import os
from pathlib import Path
import sys

# Add the script to the path so we can import it
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from setup_coderef_dirs import create_structure

class TestSetupCoderefDirs(unittest.TestCase):
    def setUp(self):
        # Create a temporary directory for each test
        self.test_dir = tempfile.mkdtemp()
        self.project_path = Path(self.test_dir)

    def tearDown(self):
        # Clean up the temporary directory
        shutil.rmtree(self.test_dir)

    def test_create_structure_creates_all_dirs(self):
        """Test that all expected directories are created."""
        result = create_structure(str(self.project_path), dry_run=False)
        
        self.assertTrue(result['success'])
        
        # Check parent directories
        self.assertTrue((self.project_path / '.coderef').exists())
        self.assertTrue((self.project_path / 'coderef').exists())

        # Check subdirectories
        expected_dirs = [
            '.coderef/reports/complexity',
            '.coderef/diagrams',
            '.coderef/exports',
            'coderef/workorder',
            'coderef/archived',
            'coderef/standards',
            'coderef/documents',
            'coderef/reference',
            'coderef/user',
            'coderef/notes'
        ]

        for rel_path in expected_dirs:
            full_path = self.project_path / rel_path
            self.assertTrue(full_path.exists(), f"Expected directory {rel_path} to exist")

    def test_dry_run_does_not_create_dirs(self):
        """Test that dry-run does not create directories."""
        result = create_structure(str(self.project_path), dry_run=True)
        
        self.assertTrue(result['success'])
        
        # Check that directories do NOT exist
        self.assertFalse((self.project_path / '.coderef').exists())
        self.assertFalse((self.project_path / 'coderef').exists())

    def test_idempotency(self):
        """Test that running it twice doesn't fail."""
        # First run
        result1 = create_structure(str(self.project_path), dry_run=False)
        self.assertTrue(result1['success'])

        # Second run
        result2 = create_structure(str(self.project_path), dry_run=False)
        self.assertTrue(result2['success'])
        
        # Should have skipped everything the second time
        self.assertTrue(len(result2['skipped']) > 0)

if __name__ == '__main__':
    unittest.main()
